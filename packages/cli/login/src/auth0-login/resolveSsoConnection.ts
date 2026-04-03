import axios from "axios";

export async function resolveSsoConnection({
    dashboardBaseUrl,
    email
}: {
    dashboardBaseUrl: string;
    email: string;
}): Promise<string> {
    const response = await axios.post(
        `${dashboardBaseUrl}/api/sso/resolve`,
        { email },
        {
            headers: { "Content-Type": "application/json" }
        }
    );
    const responseData = response.data;
    if (typeof responseData !== "object" || responseData == null) {
        throw new Error("Invalid response format from SSO resolve endpoint");
    }
    const { connection } = responseData;
    if (typeof connection !== "string" || connection.length === 0) {
        throw new Error("No SSO connection found for this email");
    }
    return connection;
}
