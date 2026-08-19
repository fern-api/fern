using NUnit.Framework;
using SeedErrors;
using SeedErrors.Test.Unit.MockServer;
using SeedErrors.Test.Utils;

namespace SeedErrors.Test.Unit.MockServer.Simple;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FooTest : BaseMockServerTest
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
                    .WithPath("/foo2")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooAsync(new FooRequest { Bar = "bar" });
        JsonAssert.AreEqual(response, mockResponse);
    }
}
