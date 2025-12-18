export type UserRole = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // salt:hash
  createdAt: string;
  role: UserRole;
};

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};


