import { HttpException, HttpStatus } from '@nestjs/common';

export const coreErrorHelper = (error: any): any | HttpException => {
  const statusCode =
    error?.cause?.status ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
  const errorMessage = getErrorMessage(
    error?.cause?.message ?? error.message ?? error?.error,
  );
  throw new HttpException(
    {
      statusCode,
      error: errorMessage,
    },
    statusCode,
  );
};

function getErrorMessage(errorMessage: unknown): string {
  if (Array.isArray(errorMessage)) {
    return errorMessage.join('. ');
  } else if (typeof errorMessage === 'string') {
    return errorMessage;
  } else {
    return errorMessage as string;
  }
}
