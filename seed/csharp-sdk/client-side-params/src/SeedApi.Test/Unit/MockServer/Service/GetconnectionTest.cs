using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetconnectionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/connections/connectionId")
                    .WithParam("fields", "fields")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetconnectionAsync(
            new ServiceGetConnectionRequest { ConnectionId = "connectionId", Fields = "fields" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
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
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/connections/connectionId")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetconnectionAsync(
            new ServiceGetConnectionRequest { ConnectionId = "connectionId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
