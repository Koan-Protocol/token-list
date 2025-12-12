export const isPromiseFulfilled = <T>(
  input: PromiseSettledResult<T>,
): input is PromiseFulfilledResult<T> => input.status === "fulfilled";



export const ONE_INCH_TOKEN_API_BASE_URL =""