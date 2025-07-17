import React from 'react';
import { FloatingInput } from '@/components/ui/floating-input';
import { FloatingSelect } from '@/components/ui/floating-select';
import { Building2, MapPin, Globe } from 'lucide-react';
import { CustomerInfo, ValidationErrors } from '@/types/verification';
import { US_STATES } from '@/lib/us-states';

interface AddressInfoSectionProps {
  formData: CustomerInfo;
  validationErrors: ValidationErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function AddressInfoSection({ 
  formData, 
  validationErrors, 
  onInputChange,
  onSelectChange
}: AddressInfoSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-gray-900">
        Address Information
      </legend>

      <div>
        <FloatingInput
          id="address.line1"
          name="address.line1"
          value={formData.address.line1}
          onChange={onInputChange}
          required
          label="Address Line 1"
          icon={Building2}
          autoComplete="address-line1"
          aria-required="true"
          error={validationErrors['address.line1']}
        />
      </div>

      <div>
        <FloatingInput
          id="address.line2"
          name="address.line2"
          value={formData.address.line2}
          onChange={onInputChange}
          label="Address Line 2 (Optional)"
          icon={Building2}
          autoComplete="address-line2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FloatingInput
            id="address.locality"
            name="address.locality"
            value={formData.address.locality}
            onChange={onInputChange}
            required
            label="City"
            icon={MapPin}
            autoComplete="address-level2"
            aria-required="true"
            error={validationErrors['address.locality']}
          />
        </div>
        <div>
          <FloatingSelect
            id="address.majorAdminDivision"
            name="address.majorAdminDivision"
            value={formData.address.majorAdminDivision}
            onValueChange={(value) => onSelectChange('address.majorAdminDivision', value)}
            options={US_STATES}
            required
            label="State"
            icon={Globe}
            error={validationErrors['address.majorAdminDivision']}
          />
        </div>
        <div>
          <FloatingInput
            id="address.postalCode"
            name="address.postalCode"
            value={formData.address.postalCode}
            onChange={onInputChange}
            required
            label="Postal Code"
            icon={MapPin}
            maxLength={5}
            autoComplete="postal-code"
            inputMode="numeric"
            pattern="[0-9]{5}"
            aria-required="true"
            error={validationErrors['address.postalCode']}
          />
        </div>
      </div>

      <div>
        <FloatingInput
          id="address.minorAdminDivision"
          name="address.minorAdminDivision"
          value={formData.address.minorAdminDivision}
          onChange={onInputChange}
          label="County/District (Optional)"
          icon={MapPin}
          autoComplete="address-level3"
        />
      </div>
    </fieldset>
  );
}
