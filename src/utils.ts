interface QueryParams {
  take?: string;
  currentPage?: string;
  sort?: string;
  sortDirection?: string;
}

export const parseQueryParams = (queryParams: QueryParams) => {
  const { take, currentPage, sort, sortDirection } = queryParams;

  const skipAndTake =
    currentPage && take ? { skip: (parseInt(currentPage) - 1) * parseInt(take), take: parseInt(take) } : undefined;

  const orderBy = sort && sortDirection ? { [sort]: sortDirection } : undefined;

  return { ...skipAndTake, orderBy };
};
