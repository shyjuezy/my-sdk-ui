import React, { useId } from 'react';
import { FloatingInput } from '@/components/ui/floating-input';
import { Mail, Phone, CheckCircle2 } from 'lucide-react';
import { CustomerInfo, ValidationErrors } from '@/types/verification';
import { validatePhoneNumber } from '@/lib/validation';

interface ContactInfoSectionProps {
  formData: CustomerInfo;
  validationErrors: ValidationErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ContactInfoSection({ 
  formData, 
  validationErrors, 
  onInputChange 
}: ContactInfoSectionProps) {
  const emailErrorId = useId();
  const phoneErrorId = useId();

  return (
    <fieldset>
      <legend className="sr-only">Contact Information</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatingInput
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onInputChange}
            required
            label="Email"
            icon={Mail}
            autoComplete="email"
            aria-required="true"
            aria-invalid={!!validationErrors.email}
            aria-describedby={
              validationErrors.email ? emailErrorId : undefined
            }
            error={validationErrors.email}
          />
        </div>
        <div>
          <FloatingInput
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={onInputChange}
            required
            label="Phone"
            icon={Phone}
            autoComplete="tel"
            inputMode="tel"
            aria-required="true"
            aria-invalid={!!validationErrors.phone}
            aria-describedby={
              validationErrors.phone ? phoneErrorId : undefined
            }
            error={validationErrors.phone}
          />
          {formData.phone &&
            validatePhoneNumber(formData.phone) && (
              <p className="text-sm text-green-600 flex items-center gap-1 animate-fade-in mt-1">
                <CheckCircle2 className="w-3 h-3" />
                Valid US phone number
              </p>
            )}
        </div>
      </div>
    </fieldset>
  );
}
