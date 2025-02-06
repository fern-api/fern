using NUnit.Framework;
using System.Threading.Tasks;
using SeedMixedFileDirectory;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedMixedFileDirectory.Core;

    namespace SeedMixedFileDirectory.Test.Unit.MockServer;

[TestFixture]
public class CreateTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
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

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/organizations/").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Organization.CreateAsync(new CreateOrganizationRequest{ 
                Name = "name"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
