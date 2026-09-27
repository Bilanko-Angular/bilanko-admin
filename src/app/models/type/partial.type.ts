/**
 * Rend tous les champs optionnels SAUF ceux listés dans K,
 * qui restent obligatoires.
 */
type PartialExcept<T, K extends keyof T> =
  Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Rend optionnels UNIQUEMENT les champs listés dans K.
 * Les autres restent obligatoires.
 */
type PartialOnly<T, K extends keyof T> =
  Omit<T, K> & Partial<Pick<T, K>>;
