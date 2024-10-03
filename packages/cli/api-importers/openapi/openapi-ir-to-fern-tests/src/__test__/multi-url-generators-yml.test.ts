import { testConvertOpenAPI } from "../testConvertOpenApi";

describe("multi-url-generators-yml", () => {
    testConvertOpenAPI("multi-url-generators-yml", "openapi.yml", {
        environmentOverrides: {
            "default-environment": "Production",
            environments: {
                Production: {
                    urls: {
                        auth: "http://auth.com",
                        user: "http://user.com"
                    }
                }
            },
            "default-url": "user"
        }
    });
});
