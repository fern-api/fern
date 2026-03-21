using NUnit.Framework;
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
}
