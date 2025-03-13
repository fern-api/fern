using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedAudiences.Core;

namespace SeedAudiences.Test.Unit.MockServer;

[TestFixture]
public class GetDirectThreadTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        var response = await Client.FolderD.Service.GetDirectThreadAsync(RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<FolderD.Response>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
