import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

export async function getTokens() {
  try {
    const { tokens } = await fetchAuthSession();
    return tokens ?? null;
  } catch {
    return null;
  }
}

export async function getUser() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}
