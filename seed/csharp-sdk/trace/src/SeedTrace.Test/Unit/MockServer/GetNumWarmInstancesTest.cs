using NUnit.Framework;
using SeedTrace.Core;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetNumWarmInstancesTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "JAVA": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sysprop/num-warm-instances")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Sysprop.GetNumWarmInstancesAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Dictionary<Language, int>>(mockResponse))
                .UsingDefaults()
        );
    }
}
