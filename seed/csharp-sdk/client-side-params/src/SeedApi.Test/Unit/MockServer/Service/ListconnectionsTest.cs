using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ListconnectionsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client.Service.ListconnectionsAsync(
            new ServiceListConnectionsRequest
            {
                Strategy = "strategy",
                Name = "name",
                Fields = "fields",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name",
                "display_name": "display_name",
                "strategy": "strategy",
                "options": {
                  "key": "value"
                },
                "enabled_clients": [
                  "enabled_clients"
                ],
                "realms": [
                  "realms"
                ],
                "is_domain_connection": true,
                "metadata": {
                  "key": "value"
                }
              }
            ]
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/api/connections").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.ListconnectionsAsync(
            new ServiceListConnectionsRequest()
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
