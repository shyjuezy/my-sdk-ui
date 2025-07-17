import React from 'react';
import { FloatingInput } from '@/components/ui/floating-input';
import { User } from 'lucide-react';
import { CustomerInfo, ValidationErrors } from '@/types/verification';

interface PersonalInfoSectionProps {
  formData: CustomerInfo;
  validationErrors: ValidationErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PersonalInfoSection({ 
  formData, 
  validationErrors, 
  onInputChange 
}: PersonalInfoSectionProps) {
  return (
    <fieldset>
      <legend className="sr-only">Personal Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FloatingInput
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onInputChange}
            required
            label="First Name"
            icon={User}
            autoComplete="given-name"
            aria-required="true"
            error={validationErrors.firstName}
          />
        </div>
        <div>
          <FloatingInput
            id="middleName"
            name="middleName"
            value={formData.middleName}
            onChange={onInputChange}
            label="Middle Name"
            icon={User}
            autoComplete="additional-name"
          />
        </div>
        <div>
          <FloatingInput
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onInputChange}
            required
            label="Last Name"
            icon={User}
            autoComplete="family-name"
            aria-required="true"
            error={validationErrors.lastName}
          />
        </div>
      </div>
    </fieldset>
  );
}
