using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedAudiences.Core;
using SeedAudiences.FolderA;
using SeedAudiences.Test.Unit.MockServer;

namespace SeedAudiences.Test.Unit.MockServer.FolderA;

[TestFixture]
public class GetDirectThreadTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "foo": {
                "foo": {
                  "bar_property": "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
                }
              }
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderA.Service.GetDirectThreadAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SeedAudiences.FolderA.Response>(mockResponse))
                .UsingDefaults()
        );
    }
}
