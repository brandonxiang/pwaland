export async function request(url) {
  const response = await fetch(host + url);
  return await response.json();
}

export function parseJson(str) {
  try {
    return JSON.parse(str)
  } catch {
    return {};
  }
}

console.log(process.env.NODE_ENV);

const host = process.env.NODE_ENV === 'production' ? 'https://pwaland.brandonxiang.top' : 'https://pwaland.brandonxiang.top';