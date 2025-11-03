using NUnit.Framework;
using SeedTrace.Core;

namespace SeedTrace.Test_.Unit.MockServer;

[TestFixture]
public class GetHomepageProblemsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              "string",
              "string"
            ]
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/homepage-problems").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Homepage.GetHomepageProblemsAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<string>>(mockResponse)).UsingDefaults()
        );
    }
}
