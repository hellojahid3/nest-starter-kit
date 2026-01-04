export type TResponse<T> = {
  success: boolean;
  statusCode: number;
  path: string;
  message?: string;
  data: T;
  timestamp: string;
};

export type PagedResult<T> = {
  data: T;
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    hasMore: boolean;
  };
};
