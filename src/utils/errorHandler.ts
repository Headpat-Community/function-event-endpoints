export function handleError(message: string, type: string, code: number) {
  return {
    error: message,
    type: type,
    code: code,
  };
}
