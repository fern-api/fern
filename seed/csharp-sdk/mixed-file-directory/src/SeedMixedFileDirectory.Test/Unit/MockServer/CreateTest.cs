using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedMixedFileDirectory;
using SeedMixedFileDirectory.Core;

namespace SeedMixedFileDirectory.Test.Unit.MockServer;

[TestFixture]
public class CreateTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
            new CreateOrganizationRequest { Name = "name" },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Organization>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
