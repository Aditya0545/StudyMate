// List of email addresses that have admin access
export const ADMIN_EMAILS = [
  'adityakumar2019.ak@gmail.com',  // Your email
  // Add more admin emails here
];

// Function to check if an email is an admin
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
} 