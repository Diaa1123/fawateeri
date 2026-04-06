export type UserRole = "admin" | "viewer" | "team";

export interface User {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  password: string; // كلمة السر بنص عادي (للأدمن فقط)
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface UserPayload {
  userId: string;
  username: string;
  role: UserRole;
}
