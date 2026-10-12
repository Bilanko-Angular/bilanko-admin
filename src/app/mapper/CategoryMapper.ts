import { CategorySearch } from '../models/DTO/category/CategoryDTOs';
import { AdminCategory } from '../models/category/admin-category';

export class CategoryMapper {
  static dtoToAdminCategory(dto: CategorySearch): AdminCategory {
    return {
      id: dto.id,
      name: dto.name,
      createdAt: '', // API ne renvoie pas la date dans CategorySearch
      elementsCount: dto.numElement || 0,
      usersCount: dto.numUser || 0,
      categoryType: dto.categoryType
    };
  }
}
