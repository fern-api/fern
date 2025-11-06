using NUnit.Framework;
using SeedAudiences.Core;
using SeedAudiences.Test.Unit.MockServer;

namespace SeedAudiences.Test.Unit.MockServer.FolderD;

[TestFixture]
public class GetDirectThreadTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "foo": "foo"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/partner-path").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.FolderD.Service.GetDirectThreadAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<SeedAudiences.FolderD.Response>(mockResponse))
                .UsingDefaults()
        );
    }
}
