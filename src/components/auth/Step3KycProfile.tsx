'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ASSETS } from '@/core';
import { KycService } from '@/core/services/kyc.service';
import { StorageService } from '@/core/services/storage.service';

interface UploadedDoc {
  name: string;
  size: string;
  previewUrl?: string;
  rawFile?: File;
}

interface Step3KycProfileProps {
  onSuccess: (data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dob: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    occupation: string;
    annualIncome: string;
    idType: string;
    idNumber: string;
    idFrontDoc: UploadedDoc;
    idBackDoc?: UploadedDoc | null;
  }) => void;
  onBackToVerification?: () => void;
}

export const Step3KycProfile: React.FC<Step3KycProfileProps> = ({
  onSuccess,
  onBackToVerification,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [dob, setDob] = useState('');
  const [idType, setIdType] = useState<'passport' | 'drivers_license' | 'national_id' | 'ssn'>('passport');
  const [idNumber, setIdNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateRegion, setStateRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country] = useState('USA');
  const [occupation, setOccupation] = useState('');
  const [annualIncome, setAnnualIncome] = useState('$100,000 - $250,000');

  const [idFrontDoc, setIdFrontDoc] = useState<UploadedDoc | null>(null);
  const [idBackDoc, setIdBackDoc] = useState<UploadedDoc | null>(null);
  const [isDraggingFront, setIsDraggingFront] = useState(false);
  const [isDraggingBack, setIsDraggingBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [kycErrors, setKycErrors] = useState<Record<string, string>>({});
  const [shakingFields, setShakingFields] = useState<Record<string, boolean>>({});

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const triggerShake = (fields: string[]) => {
    const nextShaking = { ...shakingFields };
    fields.forEach((f) => {
      nextShaking[f] = true;
    });
    setShakingFields(nextShaking);

    setTimeout(() => {
      setShakingFields((prev) => {
        const reset = { ...prev };
        fields.forEach((f) => {
          reset[f] = false;
        });
        return reset;
      });
    }, 450);
  };

  const handleProcessFile = (file: File, side: 'front' | 'back') => {
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const doc: UploadedDoc = {
      name: file.name,
      size: formattedSize,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      rawFile: file,
    };

    if (side === 'front') {
      setIdFrontDoc(doc);
      if (kycErrors.idFront) setKycErrors((prev) => ({ ...prev, idFront: undefined as any }));
    } else {
      setIdBackDoc(doc);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const toShake: string[] = [];

    if (!firstName.trim()) {
      newErrors.firstName = 'Legal first name is required.';
      toShake.push('firstName');
    }
    if (!lastName.trim()) {
      newErrors.lastName = 'Legal last name is required.';
      toShake.push('lastName');
    }
    if (!dob) {
      newErrors.dob = 'Date of birth is required.';
      toShake.push('dob');
    }
    if (!streetAddress.trim()) {
      newErrors.streetAddress = 'Residential address is required.';
      toShake.push('streetAddress');
    }
    if (!city.trim()) {
      newErrors.city = 'City is required.';
      toShake.push('city');
    }
    if (!stateRegion.trim()) {
      newErrors.stateRegion = 'State / Province is required.';
      toShake.push('stateRegion');
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required.';
      toShake.push('postalCode');
    }
    if (!occupation.trim()) {
      newErrors.occupation = 'Occupation is required.';
      toShake.push('occupation');
    }
    if (!idNumber.trim()) {
      newErrors.idNumber = 'Government ID number is required.';
      toShake.push('idNumber');
    }
    if (!idFrontDoc) {
      newErrors.idFront = 'Please upload the front of your government ID.';
      toShake.push('idFront');
    }

    if (Object.keys(newErrors).length > 0) {
      setKycErrors(newErrors);
      triggerShake(toShake);
      return;
    }

    setKycErrors({});
    setIsSubmitting(true);

    try {
      let idFrontUrl = '';
      if (idFrontDoc?.rawFile) {
        const uploadRes = await StorageService.uploadKyc(idFrontDoc.rawFile, 'id_front');
        idFrontUrl = uploadRes.url;
      }

      let idBackUrl = '';
      if (idBackDoc?.rawFile) {
        const uploadRes = await StorageService.uploadKyc(idBackDoc.rawFile, 'id_back');
        idBackUrl = uploadRes.url;
      }

      await KycService.submitKyc({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        middle_name: middleName.trim() || undefined,
        date_of_birth: dob,
        street_address: streetAddress.trim(),
        city: city.trim(),
        state: stateRegion.trim(),
        postal_code: postalCode.trim(),
        country,
        occupation: occupation.trim(),
        annual_income: annualIncome,
        id_type: idType,
        id_number: idNumber.trim(),
        profile_picture_url: '',
        id_front_image_url: idFrontUrl,
        id_back_image_url: idBackUrl,
        proof_of_address_url: ''
      });
      setIsSubmitting(false);
      onSuccess({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: middleName.trim() || undefined,
        dob,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: stateRegion.trim(),
        postalCode: postalCode.trim(),
        country,
        occupation: occupation.trim(),
        annualIncome,
        idType,
        idNumber: idNumber.trim(),
        idFrontDoc: idFrontDoc!,
        idBackDoc,
      });
    } catch (err: any) {
      setIsSubmitting(false);
      setKycErrors({ apiError: err.message || 'Failed to submit KYC.' });
      // Trigger a shake for the first visual field to indicate an error state if needed
      triggerShake(['firstName']);
    }
  };

  return (
    <div className="transition-opacity duration-300 animate-fadeIn space-y-3">
      {/* Header with Custom KYC PNG Icon */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins font-bold text-xl sm:text-2xl text-[#1A1818] tracking-tight">
            KYC Identity Profile
          </h1>
          <p className="text-gray-500 text-xs mt-0.5 font-normal leading-relaxed">
            Provide legal details and identification for federal compliance.
          </p>
        </div>
        <div className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center p-1 bg-[#FAF7F2] rounded-xl border border-gray-100">
          <Image src={ASSETS.icons.kyc} alt="KYC Verification" width={32} height={32} className="object-contain" />
        </div>
      </div>



      <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
        {/* Section A: Legal Names & DOB */}
        <div className="bg-[#FAF7F2]/60 p-2.5 rounded-xl border border-gray-100 space-y-2">
          <span className="text-[10px] font-bold text-[#B81446] uppercase tracking-wider block">
            1. Legal Personal Identity
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (kycErrors.firstName) setKycErrors((prev) => ({ ...prev, firstName: undefined as any }));
                }}
                placeholder="Sarah"
                className={`w-full ${
                  kycErrors.firstName ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                  shakingFields.firstName ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.firstName && (
                <p className="text-[10px] text-red-600 mt-0.5">{kycErrors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (kycErrors.lastName) setKycErrors((prev) => ({ ...prev, lastName: undefined as any }));
                }}
                placeholder="Jenkins"
                className={`w-full ${
                  kycErrors.lastName ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                  shakingFields.lastName ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.lastName && (
                <p className="text-[10px] text-red-600 mt-0.5">{kycErrors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                Middle Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Marie"
                className="w-full border border-gray-200 bg-white rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dob}
                max="2008-01-01"
                onChange={(e) => {
                  setDob(e.target.value);
                  if (kycErrors.dob) setKycErrors((prev) => ({ ...prev, dob: undefined as any }));
                }}
                className={`w-full ${
                  kycErrors.dob ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] focus:outline-none focus:border-[#B81446] ${
                  shakingFields.dob ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.dob && (
                <p className="text-[10px] text-red-600 mt-0.5">{kycErrors.dob}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section B: Residential Address & Employment */}
        <div className="bg-[#FAF7F2]/60 p-2.5 rounded-xl border border-gray-100 space-y-2">
          <span className="text-[10px] font-bold text-[#B81446] uppercase tracking-wider block">
            2. Residential Address & Occupation
          </span>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => {
                setStreetAddress(e.target.value);
                if (kycErrors.streetAddress) setKycErrors((prev) => ({ ...prev, streetAddress: undefined as any }));
              }}
              placeholder="742 Evergreen Terrace, Apt 4B"
              className={`w-full ${
                kycErrors.streetAddress ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
              } border rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                shakingFields.streetAddress ? 'animate-shake' : ''
              }`}
            />
            {kycErrors.streetAddress && (
              <p className="text-[10px] text-red-600 mt-0.5">{kycErrors.streetAddress}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (kycErrors.city) setKycErrors((prev) => ({ ...prev, city: undefined as any }));
                }}
                placeholder="New York"
                className={`w-full ${
                  kycErrors.city ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                  shakingFields.city ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.city && (
                <p className="text-[9px] text-red-600 mt-0.5">{kycErrors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stateRegion}
                onChange={(e) => {
                  setStateRegion(e.target.value);
                  if (kycErrors.stateRegion) setKycErrors((prev) => ({ ...prev, stateRegion: undefined as any }));
                }}
                placeholder="NY"
                className={`w-full ${
                  kycErrors.stateRegion ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                  shakingFields.stateRegion ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.stateRegion && (
                <p className="text-[9px] text-red-600 mt-0.5">{kycErrors.stateRegion}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => {
                  setPostalCode(e.target.value);
                  if (kycErrors.postalCode) setKycErrors((prev) => ({ ...prev, postalCode: undefined as any }));
                }}
                placeholder="10001"
                className={`w-full ${
                  kycErrors.postalCode ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                  shakingFields.postalCode ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.postalCode && (
                <p className="text-[9px] text-red-600 mt-0.5">{kycErrors.postalCode}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                Occupation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => {
                  setOccupation(e.target.value);
                  if (kycErrors.occupation) setKycErrors((prev) => ({ ...prev, occupation: undefined as any }));
                }}
                placeholder="Software Engineer"
                className={`w-full ${
                  kycErrors.occupation ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
                } border rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                  shakingFields.occupation ? 'animate-shake' : ''
                }`}
              />
              {kycErrors.occupation && (
                <p className="text-[10px] text-red-600 mt-0.5">{kycErrors.occupation}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
                Annual Income
              </label>
              <select
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                className="w-full border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-xs text-[#1A1818] focus:outline-none focus:border-[#B81446]"
              >
                <option value="Under $50,000">Under $50,000</option>
                <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                <option value="$250,000+">$250,000+ (Private Tier)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section C: Government ID & Document Upload */}
        <div className="bg-[#FAF7F2]/60 p-2.5 rounded-xl border border-gray-100 space-y-2">
          <span className="text-[10px] font-bold text-[#B81446] uppercase tracking-wider block">
            3. Government ID & Supabase Document Storage
          </span>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-1">
              Identification Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-1 text-[11px]">
              {(
                [
                  { id: 'passport', label: 'Passport' },
                  { id: 'drivers_license', label: 'License' },
                  { id: 'national_id', label: 'National ID' },
                  { id: 'ssn', label: 'SSN' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIdType(item.id)}
                  className={`py-1.5 px-1 rounded-lg font-medium transition-all text-center cursor-pointer ${
                    idType === item.id
                      ? 'bg-[#B81446] text-white font-semibold shadow-xs'
                      : 'bg-white text-gray-600 border border-gray-200/70 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">
              Government ID Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => {
                setIdNumber(e.target.value);
                if (kycErrors.idNumber) setKycErrors((prev) => ({ ...prev, idNumber: undefined as any }));
              }}
              placeholder="e.g. N94829104 or DL-4829102"
              className={`w-full ${
                kycErrors.idNumber ? 'border-red-500 bg-red-50/20' : 'border-gray-200 bg-white'
              } border rounded-lg px-2.5 py-1.5 text-xs text-[#1A1818] placeholder:text-gray-400 focus:outline-none focus:border-[#B81446] ${
                shakingFields.idNumber ? 'animate-shake' : ''
              }`}
            />
            {kycErrors.idNumber && (
              <p className="text-[10px] text-red-600 mt-0.5">{kycErrors.idNumber}</p>
            )}
          </div>

          {/* Twin Document Upload Dropzones */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Front Dropzone */}
            <div>
              <span className="block text-[11px] font-semibold text-gray-700 mb-1">
                ID Front Photo <span className="text-red-500">*</span>
              </span>
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleProcessFile(e.target.files[0], 'front');
                }}
                className="hidden"
              />

              {idFrontDoc ? (
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-left relative flex items-center justify-between">
                  <div className="truncate pr-1">
                    <span className="text-[10px] font-bold text-emerald-800 block truncate">
                      ✓ {idFrontDoc.name}
                    </span>
                    <span className="text-[9px] text-emerald-600 block">{idFrontDoc.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdFrontDoc(null)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold p-1 cursor-pointer"
                    aria-label="Remove front document"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFront(true);
                  }}
                  onDragLeave={() => setIsDraggingFront(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFront(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProcessFile(e.dataTransfer.files[0], 'front');
                    }
                  }}
                  onClick={() => frontInputRef.current?.click()}
                  className={`p-2.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    isDraggingFront
                      ? 'border-[#B81446] bg-[#B81446]/5'
                      : kycErrors.idFront
                      ? 'border-red-500 bg-red-50/20'
                      : 'border-gray-200 hover:border-[#B81446] bg-white hover:bg-gray-50'
                  } ${shakingFields.idFront ? 'animate-shake' : ''}`}
                >
                  <div className="w-5 h-5 mx-auto mb-1 relative opacity-75">
                    <Image src={ASSETS.icons.document} alt="Upload" fill className="object-contain" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#1A1818] block">
                    Drop or Browse
                  </span>
                  <span className="text-[9px] text-gray-400">JPG, PNG, PDF</span>
                </div>
              )}
              {kycErrors.idFront && (
                <p className="text-[9px] text-red-600 mt-0.5">{kycErrors.idFront}</p>
              )}
            </div>

            {/* Back Dropzone */}
            <div>
              <span className="block text-[11px] font-semibold text-gray-700 mb-1">
                ID Back Photo <span className="text-gray-400 font-normal">(Optional)</span>
              </span>
              <input
                ref={backInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleProcessFile(e.target.files[0], 'back');
                }}
                className="hidden"
              />

              {idBackDoc ? (
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-left relative flex items-center justify-between">
                  <div className="truncate pr-1">
                    <span className="text-[10px] font-bold text-emerald-800 block truncate">
                      ✓ {idBackDoc.name}
                    </span>
                    <span className="text-[9px] text-emerald-600 block">{idBackDoc.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdBackDoc(null)}
                    className="text-gray-400 hover:text-red-500 text-xs font-bold p-1 cursor-pointer"
                    aria-label="Remove back document"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingBack(true);
                  }}
                  onDragLeave={() => setIsDraggingBack(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingBack(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProcessFile(e.dataTransfer.files[0], 'back');
                    }
                  }}
                  onClick={() => backInputRef.current?.click()}
                  className={`p-2.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    isDraggingBack
                      ? 'border-[#B81446] bg-[#B81446]/5'
                      : 'border-gray-200 hover:border-[#B81446] bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="w-5 h-5 mx-auto mb-1 relative opacity-75">
                    <Image src={ASSETS.icons.document} alt="Upload" fill className="object-contain" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#1A1818] block">
                    Drop or Browse
                  </span>
                  <span className="text-[9px] text-gray-400">JPG, PNG, PDF</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-[9.5px] text-gray-500 text-center pt-1 flex items-center justify-center gap-1">
            <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Documents are encrypted via 256-bit AES & stored in private Supabase Storage vault.</span>
          </p>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#B81446] hover:bg-[#9B103B] active:bg-[#800A2C] text-white font-poppins font-semibold py-2.5 sm:py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_6px_18px_rgba(184,20,70,0.25)] hover:shadow-[0_10px_24px_rgba(184,20,70,0.35)] hover:scale-[1.01] active:scale-[0.99] text-xs sm:text-sm flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer mt-1"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Verifying Profile...</span>
            </>
          ) : (
            <span>Continue to Security Setup</span>
          )}
        </button>
      </form>
    </div>
  );
};
