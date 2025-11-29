export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  role: 'VENDEUR' | 'ADMIN';
  nomBoutique?: string;
  categorieActivite?: string;
}