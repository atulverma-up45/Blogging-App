// Function to set a cookie
export const setCookie = (name, value, days) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  const cookieValue = `${name}=${encodeURIComponent(
    value
  )};expires=${expirationDate.toUTCString()};path=/`;
  document.cookie = cookieValue;
};

// Function to get a cookie by name
export const getCookie = (name) => {
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

// Function to delete a cookie by name
export const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
