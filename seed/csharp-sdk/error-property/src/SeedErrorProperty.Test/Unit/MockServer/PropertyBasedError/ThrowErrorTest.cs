using NUnit.Framework;
using SeedErrorProperty;
using SeedErrorProperty.Test.Unit.MockServer;
using SeedErrorProperty.Test.Utils;

namespace SeedErrorProperty.Test.Unit.MockServer.PropertyBasedError;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ThrowErrorTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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

        var response = await Client.PropertyBasedError.ThrowErrorAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsPropertyBasedErrorTest()
    {
        const string mockResponse = """
            {
              "message": "message"
            }
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
                    .WithStatusCode(400)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<SeedErrorPropertyApiException>(async () =>
            await Client.PropertyBasedError.ThrowErrorAsync()
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
        Assert.That(exception.Body, Is.EqualTo(mockResponse));
    }
}
