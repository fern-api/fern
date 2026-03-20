using NUnit.Framework;
using SeedExhaustive.Endpoints;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithInlinePathTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/params/path/param").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.GetWithInlinePathAsync(
            new GetWithInlinePath { Param = "param" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
