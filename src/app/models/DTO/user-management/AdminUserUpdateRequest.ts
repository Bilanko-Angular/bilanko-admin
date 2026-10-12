export interface AdminUserUpdateRequest {
  name: string;          // @NotBlank → requis
  subname: string;       // @NotBlank → requis
  email: string;         // @NotBlank + @Email → requis + format email
  phoneNumber?: string;  // pas d'annotation → optionnel
  adresse?: string;      // pas d'annotation → optionnel
}
