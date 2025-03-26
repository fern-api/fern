using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedSingleUrlEnvironmentDefault.Core;

namespace SeedSingleUrlEnvironmentDefault.Test.Unit.MockServer;

[TestFixture]
public class GetDummyTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/dummy").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Dummy.GetDummyAsync(RequestOptions);
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
