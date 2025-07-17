import { useState, useCallback } from 'react';
import { CustomerInfo, ValidationErrors } from '@/types/verification';
import { validateEmail, validatePhoneNumber, formatPhoneNumber } from '@/lib/validation';

export function useCustomerForm() {
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    address: {
      line1: "",
      line2: "",
      locality: "",
      minorAdminDivision: "",
      majorAdminDivision: "",
      country: "US",
      postalCode: "",
      type: "HOME",
    },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      
      // Capitalize first letter of each word for city field
      let processedValue = value;
      if (addressField === "locality") {
        processedValue = value
          .split(' ')
          .map(word => {
            if (word.length === 0) return word;
            // Handle special cases like "st." or "mt."
            if (word.toLowerCase().endsWith('.')) {
              return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(' ');
      }
      
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: processedValue,
        },
      }));
    } else {
      // Handle phone number formatting
      if (name === "phone") {
        const formattedPhone = formatPhoneNumber(value);
        setFormData((prev) => ({
          ...prev,
          [name]: formattedPhone,
        }));

        // Real-time validation for phone
        if (!formattedPhone || !validatePhoneNumber(formattedPhone)) {
          setValidationErrors((prev) => ({
            ...prev,
            phone: "Please enter a valid 10-digit US phone number",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            phone: undefined,
          }));
        }
      }
      // Handle email validation
      else if (name === "email") {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));

        // Real-time validation for email
        if (!value || !validateEmail(value)) {
          setValidationErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
          }));
        } else {
          setValidationErrors((prev) => ({
            ...prev,
            email: undefined,
          }));
        }
      }
      // Handle other fields
      else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const validateForm = useCallback((): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!formData.phone) {
      errors.phone = "Phone is required";
    } else if (!validatePhoneNumber(formData.phone)) {
      errors.phone = "Please enter a valid 10-digit US phone number";
    }
    if (!formData.address.line1.trim()) {
      errors['address.line1'] = "Address line 1 is required";
    }
    if (!formData.address.locality.trim()) {
      errors['address.locality'] = "City is required";
    }
    if (!formData.address.majorAdminDivision) {
      errors['address.majorAdminDivision'] = "State is required";
    }
    if (!formData.address.postalCode.trim()) {
      errors['address.postalCode'] = "Postal code is required";
    }

    return errors;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      phone: "",
      address: {
        line1: "",
        line2: "",
        locality: "",
        minorAdminDivision: "",
        majorAdminDivision: "",
        country: "US",
        postalCode: "",
        type: "HOME",
      },
    });
    setValidationErrors({});
  }, []);

  return {
    formData,
    validationErrors,
    setValidationErrors,
    handleInputChange,
    handleSelectChange,
    validateForm,
    resetForm,
  };
}
