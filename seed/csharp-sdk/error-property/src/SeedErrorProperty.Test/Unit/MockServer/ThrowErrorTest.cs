using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedErrorProperty.Core;

namespace SeedErrorProperty.Test.Unit.MockServer;

[TestFixture]
public class ThrowErrorTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/property-based-error")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.PropertyBasedError.ThrowErrorAsync(RequestOptions);
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
