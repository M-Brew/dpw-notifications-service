import dotenv from "dotenv";
dotenv.config();

const { USER_MANAGEMENT_SERVICE_BASE_URL } = process.env;

const verifyToken = async (token: string) => {
  try {
    const response = await fetch(
      `${USER_MANAGEMENT_SERVICE_BASE_URL}/api/auth/data`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      }
    );
    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (error) {
    console.log(error);
    return;
  }
};

export { verifyToken };