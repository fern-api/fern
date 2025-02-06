using NUnit.Framework;
using System.Threading.Tasks;
using SeedExhaustive.Types.Object;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedExhaustive.Core;

    namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnSetOfObjectsTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        [
          {
            "string": "string"
          }
        ]
        """;

        const string mockResponse = """
        [
          {
            "string": "string"
          }
        ]
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/container/set-of-objects").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(new HashSet<ObjectWithRequiredField>() {
                new ObjectWithRequiredField{ 
                    String = "string"
                }}, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
