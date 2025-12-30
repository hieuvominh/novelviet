export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface SupabaseClient {
  from: (table: string) => any;
  auth: any;
  storage: any;
}
