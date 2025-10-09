import { FernAIClient } from "@fern-api/fai-sdk";

export function getFaiClient({ token }: { token: string }): FernAIClient {
    return new FernAIClient({
        baseUrl: "https://fai.buildwithfern.com",
        token: token
    });
}
