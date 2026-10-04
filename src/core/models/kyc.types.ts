export interface KycSubmitRequest {
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  id_type: string;
  id_number: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  occupation: string;
  annual_income: string;
  profile_picture_url?: string;
  id_front_image_url?: string;
  id_back_image_url?: string;
  proof_of_address_url?: string;
}

export interface KycSubmitResponse {
  status: string;
  message: string;
  next_step: string;
}
