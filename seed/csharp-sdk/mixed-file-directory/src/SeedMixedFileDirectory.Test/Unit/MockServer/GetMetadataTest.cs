using NUnit.Framework;
using System.Threading.Tasks;
using SeedMixedFileDirectory.User.Events;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedMixedFileDirectory.Core;

    namespace SeedMixedFileDirectory.Test.Unit.MockServer;

[TestFixture]
public class GetMetadataTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {

        const string mockResponse = """
        {
          "id": "id",
          "value": {
            "key": "value"
          }
        }
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/events/metadata/").WithParam("id", "id").UsingGet())

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.User.Events.Metadata.GetMetadataAsync(new GetEventMetadataRequest{ 
                Id = "id"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
