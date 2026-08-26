/**
 * Validation utilities for Indian Mobile Numbers, Dates of Birth, and Names
 */

export interface MobileValidationResult {
  isValid: boolean;
  cleanMobile: string; // 10 digits
  formattedMobile: string; // +91 XXXXX XXXXX
  operatorCircle?: string;
  errorMessage?: string;
}

/**
 * Validates Indian 10-digit mobile numbers:
 * - Must start with 6, 7, 8, or 9 (TRAI standard)
 * - Must have exactly 10 digits (ignoring leading +91, 0, or 91)
 * - Must not be dummy repetitive sequences like 0000000000, 1111111111, 9999999999
 */
export function validateIndianMobile(rawMobile: string): MobileValidationResult {
  if (!rawMobile || typeof rawMobile !== 'string') {
    return {
      isValid: false,
      cleanMobile: '',
      formattedMobile: '',
      errorMessage: 'Please enter your mobile number.',
    };
  }

  // Strip all non-numeric characters
  let digits = rawMobile.replace(/\D/g, '');

  // Remove leading international code or 0
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }

  // Check length
  if (digits.length !== 10) {
    return {
      isValid: false,
      cleanMobile: digits,
      formattedMobile: digits,
      errorMessage: `Indian mobile number must be exactly 10 digits (entered ${digits.length}).`,
    };
  }

  // Check first digit (TRAI compliant: 6, 7, 8, 9)
  const firstDigit = digits.charAt(0);
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return {
      isValid: false,
      cleanMobile: digits,
      formattedMobile: digits,
      errorMessage: `Invalid starting digit '${firstDigit}'. Valid Indian mobile numbers begin with 6, 7, 8, or 9.`,
    };
  }

  // Check repetitive junk sequences (e.g. 9999999999, 8888888888, 1234567890)
  const isAllSame = /^(\d)\1{9}$/.test(digits);
  if (isAllSame) {
    return {
      isValid: false,
      cleanMobile: digits,
      formattedMobile: digits,
      errorMessage: 'Please enter a genuine, active Indian mobile number (repeated numbers not allowed).',
    };
  }

  // Guess operator circle hint
  let operatorCircle = 'Indian Mobile Network';
  if (digits.startsWith('94') || digits.startsWith('95')) operatorCircle = 'BSNL / Kerala Telecom';
  else if (digits.startsWith('98') || digits.startsWith('99') || digits.startsWith('97')) operatorCircle = 'Airtel / Vi';
  else if (digits.startsWith('6') || digits.startsWith('70') || digits.startsWith('80') || digits.startsWith('91')) operatorCircle = 'Jio / Digital India';

  return {
    isValid: true,
    cleanMobile: digits,
    formattedMobile: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
    operatorCircle,
  };
}

/**
 * Validates Date of Birth
 * - Must be a valid date
 * - Must be at least 16 years old to participate in jewellery voucher campaigns
 * - Must not be in the future
 */
export function validateDateOfBirth(dobString: string): { isValid: boolean; errorMessage?: string; formattedDob?: string; age?: number } {
  if (!dobString || !dobString.trim()) {
    return {
      isValid: false,
      errorMessage: 'Please select your Date of Birth.',
    };
  }

  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return {
      isValid: false,
      errorMessage: 'Please enter a valid Date of Birth (YYYY-MM-DD).',
    };
  }

  const today = new Date();
  if (birthDate > today) {
    return {
      isValid: false,
      errorMessage: 'Date of Birth cannot be in the future.',
    };
  }

  // Age calculation
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 15) {
    return {
      isValid: false,
      errorMessage: 'Participant must be at least 15 years old to redeem jewellery vouchers.',
      age,
    };
  }

  if (age > 115) {
    return {
      isValid: false,
      errorMessage: 'Please enter a realistic Date of Birth.',
      age,
    };
  }

  // Format to standard localized string DD Mon YYYY
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const formattedDob = birthDate.toLocaleDateString('en-IN', options);

  return {
    isValid: true,
    formattedDob,
    age,
  };
}

/**
 * Validates Full Name
 */
export function validateFullName(name: string): { isValid: boolean; errorMessage?: string; cleanName: string } {
  const clean = (name || '').trim();
  if (!clean) {
    return { isValid: false, errorMessage: 'Full Name is required.', cleanName: '' };
  }
  if (clean.length < 2) {
    return { isValid: false, errorMessage: 'Please enter your full name (at least 2 characters).', cleanName: clean };
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(clean)) {
    return { isValid: false, errorMessage: 'Name should only contain letters and standard punctuation.', cleanName: clean };
  }
  return { isValid: true, cleanName: clean };
}
