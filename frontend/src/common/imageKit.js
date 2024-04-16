import * as imagekit from "imagekitio-react";

export const publicKey = import.meta.env.VITE_PUBLIC_KEY;
export const urlEndpoint = import.meta.env.VITE_URL_ENDPOINT;

export const authenticator = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_DOMAIN}/imagekit-Auth`
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const { signature, expire, token } = data;
    return { signature, expire, token };
  } catch (error) {
    throw new Error(`Authentication request failed: ${error.message}`);
  }
};

