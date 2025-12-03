using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Core;

namespace SeedClientSideParams.Test.Unit.MockServer;

[TestFixture]
public class ListClientsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "start": 1,
              "limit": 1,
              "length": 1,
              "total": 1,
              "clients": [
                {
                  "client_id": "client_id",
                  "tenant": "tenant",
                  "name": "name",
                  "description": "description",
                  "global": true,
                  "client_secret": "client_secret",
                  "app_type": "app_type",
                  "logo_uri": "logo_uri",
                  "is_first_party": true,
                  "oidc_conformant": true,
                  "callbacks": [
                    "callbacks",
                    "callbacks"
                  ],
                  "allowed_origins": [
                    "allowed_origins",
                    "allowed_origins"
                  ],
                  "web_origins": [
                    "web_origins",
                    "web_origins"
                  ],
                  "grant_types": [
                    "grant_types",
                    "grant_types"
                  ],
                  "jwt_configuration": {
                    "jwt_configuration": {
                      "key": "value"
                    }
                  },
                  "signing_keys": [
                    {
                      "signing_keys": {
                        "key": "value"
                      }
                    },
                    {
                      "signing_keys": {
                        "key": "value"
                      }
                    }
                  ],
                  "encryption_key": {
                    "encryption_key": {
                      "key": "value"
                    }
                  },
                  "sso": true,
                  "sso_disabled": true,
                  "cross_origin_auth": true,
                  "cross_origin_loc": "cross_origin_loc",
                  "custom_login_page_on": true,
                  "custom_login_page": "custom_login_page",
                  "custom_login_page_preview": "custom_login_page_preview",
                  "form_template": "form_template",
                  "is_heroku_app": true,
                  "addons": {
                    "addons": {
                      "key": "value"
                    }
                  },
                  "token_endpoint_auth_method": "token_endpoint_auth_method",
                  "client_metadata": {
                    "client_metadata": {
                      "key": "value"
                    }
                  },
                  "mobile": {
                    "mobile": {
                      "key": "value"
                    }
                  }
                },
                {
                  "client_id": "client_id",
                  "tenant": "tenant",
                  "name": "name",
                  "description": "description",
                  "global": true,
                  "client_secret": "client_secret",
                  "app_type": "app_type",
                  "logo_uri": "logo_uri",
                  "is_first_party": true,
                  "oidc_conformant": true,
                  "callbacks": [
                    "callbacks",
                    "callbacks"
                  ],
                  "allowed_origins": [
                    "allowed_origins",
                    "allowed_origins"
                  ],
                  "web_origins": [
                    "web_origins",
                    "web_origins"
                  ],
                  "grant_types": [
                    "grant_types",
                    "grant_types"
                  ],
                  "jwt_configuration": {
                    "jwt_configuration": {
                      "key": "value"
                    }
                  },
                  "signing_keys": [
                    {
                      "signing_keys": {
                        "key": "value"
                      }
                    },
                    {
                      "signing_keys": {
                        "key": "value"
                      }
                    }
                  ],
                  "encryption_key": {
                    "encryption_key": {
                      "key": "value"
                    }
                  },
                  "sso": true,
                  "sso_disabled": true,
                  "cross_origin_auth": true,
                  "cross_origin_loc": "cross_origin_loc",
                  "custom_login_page_on": true,
                  "custom_login_page": "custom_login_page",
                  "custom_login_page_preview": "custom_login_page_preview",
                  "form_template": "form_template",
                  "is_heroku_app": true,
                  "addons": {
                    "addons": {
                      "key": "value"
                    }
                  },
                  "token_endpoint_auth_method": "token_endpoint_auth_method",
                  "client_metadata": {
                    "client_metadata": {
                      "key": "value"
                    }
                  },
                  "mobile": {
                    "mobile": {
                      "key": "value"
                    }
                  }
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/clients")
                    .WithParam("fields", "fields")
                    .WithParam("page", "1")
                    .WithParam("per_page", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListClientsAsync(
            new ListClientsRequest
            {
                Fields = "fields",
                IncludeFields = true,
                Page = 1,
                PerPage = 1,
                IncludeTotals = true,
                IsGlobal = true,
                IsFirstParty = true,
                AppType = new List<string>() { "app_type", "app_type" },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<PaginatedClientResponse>(mockResponse)).UsingDefaults()
        );
    }
}
