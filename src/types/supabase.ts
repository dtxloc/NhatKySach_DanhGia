export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          total_pages: number;
          cover_image_url: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          total_pages: number;
          cover_image_url?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          total_pages?: number;
          cover_image_url?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      reading_logs: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          status: "want_to_read" | "reading" | "finished" | "paused";
          current_page: number;
          rating: number | null;
          review_text: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          status: "want_to_read" | "reading" | "finished" | "paused";
          current_page?: number;
          rating?: number | null;
          review_text?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          status?: "want_to_read" | "reading" | "finished" | "paused";
          current_page?: number;
          rating?: number | null;
          review_text?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reading_logs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reading_logs_book_id_fkey";
            columns: ["book_id"];
            referencedRelation: "books";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

export type Tables = Database["public"]["Tables"];
export type ReadingStatus = Tables["reading_logs"]["Row"]["status"];
