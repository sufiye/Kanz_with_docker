import axios from "axios";
import { useTokens } from "../stores/tokenStore";

export const refreshTokens = async () => {
  try {
    const {
      refreshToken,
      setAccessToken,
      setRefreshToken,
      setRoles,
      clearTokens,
    } = useTokens.getState();

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(
      "http://localhost:8080/api/Auth/refreshToken",
      {
        refreshToken: refreshToken,
      }
    );

    const data = response.data;

    if (response.status === 200 && data.accessToken) {
      setAccessToken(data.accessToken);

      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      if (data.roles) {
        const rolesArray = Array.isArray(data.roles)
          ? data.roles
          : [data.roles];

        setRoles(rolesArray);
      }

      return {
        accessToken: data.accessToken,
        roles: data.roles || [],
      };
    } else {
      throw new Error("Invalid refresh response");
    }
  } catch (error) {
    console.error("❌ Refresh token error:", error);

    clearTokens();

    throw error;
  }
}; 