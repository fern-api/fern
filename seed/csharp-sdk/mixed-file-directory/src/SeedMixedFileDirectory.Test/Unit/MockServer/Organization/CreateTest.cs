using NUnit.Framework;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Test.Unit.MockServer;
using SeedMixedFileDirectory.Test.Utils;

namespace SeedMixedFileDirectory.Test.Unit.MockServer.Organization;

[TestFixture]
public class CreateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "users": [
                {
                  "id": "id",
                  "name": "name",
                  "age": 1
                },
                {
                  "id": "id",
                  "name": "name",
                  "age": 1
                }
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/organizations/")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Organization.CreateAsync(
            new CreateOrganizationRequest { Name = "name" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
