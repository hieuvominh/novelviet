// Common types used across the application

export interface User {
  id: string;
  email: string;
  // Add more user fields as needed
}

export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}
