using NUnit.Framework;
using SeedClientSideParams;
using SeedClientSideParams.Test.Unit.MockServer;
using SeedClientSideParams.Test.Utils;

namespace SeedClientSideParams.Test.Unit.MockServer.Service;

[TestFixture]
public class ListConnectionsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "display_name": "display_name",
                "strategy": "strategy",
                "options": {
                  "options": {
                    "key": "value"
                  }
                },
                "enabled_clients": [
                  "enabled_clients",
                  "enabled_clients"
                ],
                "realms": [
                  "realms",
                  "realms"
                ],
                "is_domain_connection": true,
                "metadata": {
                  "metadata": {
                    "key": "value"
                  }
                }
              },
              {
                "id": "id",
                "name": "name",
                "display_name": "display_name",
                "strategy": "strategy",
                "options": {
                  "options": {
                    "key": "value"
                  }
                },
                "enabled_clients": [
                  "enabled_clients",
                  "enabled_clients"
                ],
                "realms": [
                  "realms",
                  "realms"
                ],
                "is_domain_connection": true,
                "metadata": {
                  "metadata": {
                    "key": "value"
                  }
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/connections")
                    .WithParam("strategy", "strategy")
                    .WithParam("name", "name")
                    .WithParam("fields", "fields")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListConnectionsAsync(
            new ListConnectionsRequest
            {
                Strategy = "strategy",
                Name = "name",
                Fields = "fields",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
