// Shared enquiry validation (used by the form and the API route).

export const INTERESTS = ["The villa in the 3D tour", "Residential", "Commercial", "Land & development", "Something else"] as const;

export interface Enquiry {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  property?: string;
}

export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

export function validateEnquiry(e: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (e.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email.trim())) errors.email = "Please enter a valid email address.";
  if (e.phone.trim() && !/^[+\d][\d\s()-]{6,19}$/.test(e.phone.trim())) errors.phone = "Please check the phone number.";
  if (!INTERESTS.includes(e.interest as (typeof INTERESTS)[number])) errors.interest = "Please choose what you are interested in.";
  if (e.message.trim().length > 2000) errors.message = "Please keep the message under 2,000 characters.";
  return errors;
}

export const CONTACT_EMAIL = "hello.realestate@gmail.com";
