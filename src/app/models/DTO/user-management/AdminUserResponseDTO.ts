type Role = 'ADMIN' | 'MERCHANT' ; // ⚠️ adapte selon les valeurs réelles de ton enum Java

export interface AdminUserResponseDTO {
  id: number;                 // long → number (⚠️ voir note ci-dessous)
  name: string;
  subname: string;
  email: string;
  phoneNumber: string;
  role: Role;
  adresse: string;
  active: boolean;            // boolean Java → boolean TS
  lastConnectionDate: Date; // Instant → string ISO 8601
  numberOfProducts: number;   // int → number
  createdAt: Date;
}
