using NUnit.Framework;
using SeedErrors;
using SeedErrors.Test.Unit.MockServer;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test.Unit.MockServer.Simple;

[TestFixture]
public class FooWithoutEndpointErrorTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "bar": "bar"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo1")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooWithoutEndpointErrorAsync(
            new FooRequest { Bar = "bar" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
