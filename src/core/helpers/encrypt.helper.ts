import * as bcrypt from 'bcrypt';

export async function encryptString(input: string): Promise<string> {
  const genSalt = await bcrypt.genSalt();
  return await bcrypt.hash(input, genSalt);
}

export async function compareHash(
  input: string,
  encryptedInput: string,
): Promise<boolean> {
  return await bcrypt.compare(input, encryptedInput);
}
