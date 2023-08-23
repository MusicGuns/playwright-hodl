
export async function sleep(time) {
  await new Promise(r => setTimeout(r, time));
}

export function upFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}