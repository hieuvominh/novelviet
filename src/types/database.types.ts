export interface Database {
  public: {
    Tables: {
      // Add your database types here as you create tables
      // Example:
      // users: {
      //   Row: {
      //     id: string;
      //     email: string;
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     email: string;
      //     created_at?: string;
      //   };
      //   Update: {
      //     id?: string;
      //     email?: string;
      //     created_at?: string;
      //   };
      // };
    };
    Views: {
      // Add your database views here
    };
    Functions: {
      // Add your database functions here
    };
    Enums: {
      // Add your database enums here
    };
  };
}
