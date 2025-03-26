using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Put;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class AddTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "errors": [
                {
                  "category": "API_ERROR",
                  "code": "INTERNAL_SERVER_ERROR",
                  "detail": "detail",
                  "field": "field"
                },
                {
                  "category": "API_ERROR",
                  "code": "INTERNAL_SERVER_ERROR",
                  "detail": "detail",
                  "field": "field"
                }
              ]
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/id").UsingPut())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Put.AddAsync("id", new PutRequest(), RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<PutResponse>(mockResponse)).UsingDefaults()
        );
    }
}
