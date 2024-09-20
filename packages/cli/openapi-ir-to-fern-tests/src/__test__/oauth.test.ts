import { testConvertOpenAPI } from "../testConvertOpenApi";

describe("oauth", () => {
    testConvertOpenAPI("oauth", "openapi.yml", {
        authOverrides: {
            auth: "OAuthScheme",
            "auth-schemes": {
                OAuthScheme: {
                    scheme: "oauth",
                    type: "client-credentials",
                    "get-token": {
                        endpoint: "auth.get_token"
                    }
                }
            }
        }
    });
});
