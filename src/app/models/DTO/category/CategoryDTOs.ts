export enum CategoryType {
  CHARGE = 'CHARGE',
  PRODUCT = 'PRODUCT'
}

export interface CleanCategoryDTO {
  id: number;
  name: string;
  categoryType: CategoryType;
  createAt: string;
}

export interface CategoryDTO {
  id: number;
  name: string;
  categoryType: CategoryType;
  idElements?: number[];
}

export interface CategorySearch {
  id: number;
  name: string;
  numElement: number;
  numUser: number;
  categoryType: CategoryType;
}

export interface CategorySummaryDTO {
  totalCategory: number;
  totalProduct: number;
  totalCharge: number;
  actifUser: number;
}
