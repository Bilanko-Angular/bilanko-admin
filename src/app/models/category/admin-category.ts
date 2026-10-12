import { CategoryType } from '../DTO/category/CategoryDTOs';

export interface AdminCategory {
  id: number;
  name: string;
  createdAt: string;
  elementsCount: number;
  usersCount: number;
  categoryType: CategoryType;
}
