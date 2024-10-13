import { account } from "../main.js";

export function handleResponse(message: string, type: string, code: number) {
  return {
    error: message,
    type: type,
    code: code,
  };
}

export async function checkAuthentication(userId: string) {
  if (!userId) {
    return handleResponse(
        "You must be logged in to perform this action.",
        "unauthorized",
        401,
    );
  }

  try {
    await account.get();
  } catch (error) {
    return handleResponse(
        "You must be logged in to perform this action.",
        "unauthorized",
        401,
    );
  }
}
