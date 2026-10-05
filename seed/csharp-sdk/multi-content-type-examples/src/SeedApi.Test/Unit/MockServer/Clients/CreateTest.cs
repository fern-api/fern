using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Clients;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "client": {
                "name": "Acme Corp",
                "email": "contact@acme.com"
              }
            }
            """;

        const string mockResponse = """
            {
              "client": {
                "id": "client-123",
                "name": "Acme Corp",
                "email": "contact@acme.com"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/clients")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(201)
                    .WithBody(mockResponse)
            );

        var response = await Client.Clients.CreateAsync(
            new ClientRequest
            {
                Client = new Client { Name = "Acme Corp", Email = "contact@acme.com" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
