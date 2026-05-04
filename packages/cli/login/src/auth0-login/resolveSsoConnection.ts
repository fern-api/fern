import { CliError } from "@fern-api/task-context";
import axios from "axios";

export async function resolveSsoConnection({
    dashboardBaseUrl,
    email
}: {
    dashboardBaseUrl: string;
    email: string;
}): Promise<string> {
    let response;
    try {
        response = await axios.post(
            `${dashboardBaseUrl}/api/sso/resolve`,
            { email },
            {
                headers: { "Content-Type": "application/json" }
            }
        );
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            throw new CliError({
                message: `No SSO connection associated with email: ${email}`,
                code: CliError.Code.AuthError
            });
        }
        throw error;
    }
    const responseData = response.data;
    if (typeof responseData !== "object" || responseData == null) {
        throw new CliError({
            message: "Invalid response format from SSO resolve endpoint",
            code: CliError.Code.AuthError
        });
    }
    const { connection } = responseData;
    if (typeof connection !== "string" || connection.length === 0) {
        throw new CliError({
            message: "No SSO connection found for this email",
            code: CliError.Code.AuthError
        });
    }
    return connection;
}
