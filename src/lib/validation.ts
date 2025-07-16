export const formatPhoneNumber = (value: string): string => {
  // Remove all non-numeric characters
  const numbers = value.replace(/\D/g, '');
  
  // Format as US phone number: +1 (XXX) XXX-XXXX
  if (numbers.length === 0) return '';
  if (numbers.length === 1 && numbers[0] === '1') return '+1';
  
  // Handle numbers with country code
  if (numbers.startsWith('1') && numbers.length > 1) {
    const areaCode = numbers.substring(1, 4);
    const middle = numbers.substring(4, 7);
    const last = numbers.substring(7, 11);
    
    if (numbers.length <= 1) return '+1';
    if (numbers.length <= 4) return `+1 (${areaCode}`;
    if (numbers.length <= 7) return `+1 (${areaCode}) ${middle}`;
    return `+1 (${areaCode}) ${middle}-${last}`;
  }
  
  // Handle numbers without country code
  const areaCode = numbers.substring(0, 3);
  const middle = numbers.substring(3, 6);
  const last = numbers.substring(6, 10);
  
  if (numbers.length <= 3) return areaCode;
  if (numbers.length <= 6) return `(${areaCode}) ${middle}`;
  return `(${areaCode}) ${middle}-${last}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove all non-numeric characters
  const numbers = phone.replace(/\D/g, '');
  
  // Valid US phone number should have 10 digits (with or without country code 1)
  return numbers.length === 10 || (numbers.length === 11 && numbers.startsWith('1'));
};

export const getPhoneNumberForAPI = (formattedPhone: string): string => {
  // Extract just the numbers and ensure it starts with +1
  const numbers = formattedPhone.replace(/\D/g, '');
  
  if (numbers.length === 10) {
    return `+1${numbers}`;
  } else if (numbers.length === 11 && numbers.startsWith('1')) {
    return `+${numbers}`;
  }
  
  return formattedPhone; // Return as-is if not valid format
};

export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
};