import { GlobalPaginationDto } from "../dto/pagination.dto";

export const globalPaginationHelper = (
  dto: GlobalPaginationDto,
): {
  skip: number;
  take: number;
  order?: { [key: string]: 'ASC' | 'DESC' };
} => {
  const { pageNumber, limit, orderBy, order } = dto;
  const orderData: { [key: string]: 'ASC' | 'DESC' } = {};

  if (orderBy && order) {
    orderData[orderBy] = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  }

  return {
    skip: (pageNumber - 1) * limit,
    take: limit,
    order: orderData[orderBy] ? orderData : undefined,
  };
};