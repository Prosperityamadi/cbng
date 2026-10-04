import bcrypt
from fastapi import HTTPException
from api.database import get_db_cursor
from api.models.users import UserProfileResponse, UserProfileUpdateRequest, ChangePasswordRequest, ChangePinRequest

class UserService:
    @staticmethod
    def get_user_profile(user_id: str) -> UserProfileResponse:
        with get_db_cursor() as cursor:
            # Join user, kyc, and accounts
            cursor.execute("""
                SELECT 
                    u.id, u.email, u.phone_number, u.role, u.status, u.is_email_verified, u.is_phone_verified, u.profile_picture_url, u.created_at,
                    k.first_name, k.last_name, k.date_of_birth, k.street_address, k.city, k.state, k.postal_code, k.country, k.kyc_status,
                    a.tier as account_tier
                FROM users u
                LEFT JOIN kyc_profiles k ON u.id = k.user_id
                LEFT JOIN accounts a ON u.id = a.user_id
                WHERE u.id = %s
            """, (user_id,))
            
            row = cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")
                
            pic_url = row["profile_picture_url"]
            if pic_url and not pic_url.startswith("http") and not pic_url.startswith("/api/py/"):
                cache_buster = int(row["created_at"].timestamp()) if row.get("created_at") else "1"
                # If we have an updated_at, we should ideally use it. Let's just use a hash of the pic_url string itself since pic_url contains the timestamp!
                # Since we save new_file_path = f"avatars/{user_id}_{int(time.time())}.{ext}", we can just extract the time.time() part.
                pic_url = f"/api/py/storage/avatars/{user_id}?v={pic_url.split('_')[-1].split('.')[0]}"

            return UserProfileResponse(
                id=row["id"],
                email=row["email"],
                phone_number=row["phone_number"],
                role=row["role"],
                status=row["status"],
                is_email_verified=row["is_email_verified"],
                is_phone_verified=row["is_phone_verified"],
                profile_picture_url=pic_url,
                created_at=row["created_at"],
                first_name=row["first_name"],
                last_name=row["last_name"],
                date_of_birth=row["date_of_birth"],
                street_address=row["street_address"],
                city=row["city"],
                state=row["state"],
                postal_code=row["postal_code"],
                country=row["country"],
                kyc_status=row["kyc_status"] if row["kyc_status"] else "unverified",
                account_tier=row["account_tier"],
                has_active_account=row["account_tier"] is not None
            )

    @staticmethod
    def update_profile(user_id: str, req: UserProfileUpdateRequest):
        with get_db_cursor() as cursor:
            updates = []
            params = []
            if req.phone_number is not None:
                updates.append("phone_number = %s")
                params.append(req.phone_number)
            if req.profile_picture_url is not None:
                updates.append("profile_picture_url = %s")
                params.append(req.profile_picture_url)
                
            if not updates:
                return {"status": "no_changes", "message": "Nothing to update."}
                
            query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s RETURNING id"
            params.append(user_id)
            cursor.execute(query, tuple(params))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="User not found")
                
        return {"status": "success", "message": "Profile updated successfully."}

    @staticmethod
    def change_password(user_id: str, req: ChangePasswordRequest):
        with get_db_cursor() as cursor:
            cursor.execute("SELECT password_hash FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
                
            # Verify old password
            if not bcrypt.checkpw(req.current_password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                raise HTTPException(status_code=400, detail="Incorrect current password")
                
            # Hash new password
            new_hash = bcrypt.hashpw(req.new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute("UPDATE users SET password_hash = %s WHERE id = %s", (new_hash, user_id))
            
        return {"status": "success", "message": "Password changed successfully."}

    @staticmethod
    def change_pin(user_id: str, req: ChangePinRequest):
        from api.services.account_service import AccountService
        AccountService.validate_pin_strength(req.new_pin)

        with get_db_cursor() as cursor:
            # Check security_credentials first, then fallback to accounts
            cursor.execute("SELECT pin_hash FROM security_credentials WHERE user_id = %s", (user_id,))
            sec = cursor.fetchone()
            current_hash = sec["pin_hash"] if sec else None

            if not current_hash:
                cursor.execute("SELECT transaction_pin_hash FROM accounts WHERE user_id = %s", (user_id,))
                account = cursor.fetchone()
                if account and account.get("transaction_pin_hash"):
                    current_hash = account["transaction_pin_hash"]

            if not current_hash:
                raise HTTPException(status_code=404, detail="No security credentials found. Complete account setup first.")

            # Verify old PIN
            if not bcrypt.checkpw(req.current_pin.encode('utf-8'), current_hash.encode('utf-8')):
                raise HTTPException(status_code=400, detail="Incorrect current 4-digit PIN.")

            # Hash new 4-digit PIN
            new_hash = bcrypt.hashpw(req.new_pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Upsert into security_credentials
            cursor.execute("""
                INSERT INTO security_credentials (user_id, pin_hash, pin_unhashed, failed_pin_attempts, is_locked, updated_at)
                VALUES (%s, %s, %s, 0, FALSE, NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    pin_hash = EXCLUDED.pin_hash,
                    pin_unhashed = EXCLUDED.pin_unhashed,
                    failed_pin_attempts = 0,
                    is_locked = FALSE,
                    updated_at = NOW();
            """, (user_id, new_hash, req.new_pin))

            # Update accounts if column exists
            cursor.execute("UPDATE accounts SET transaction_pin_hash = %s WHERE user_id = %s", (new_hash, user_id))

        return {"status": "success", "message": "Transaction PIN changed successfully."}
