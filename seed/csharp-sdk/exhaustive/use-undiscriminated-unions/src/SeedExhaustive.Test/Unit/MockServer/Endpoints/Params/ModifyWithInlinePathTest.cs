using NUnit.Framework;
using SeedExhaustive.Endpoints;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ModifyWithInlinePathTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            "string"
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params/path/param")
                    .WithHeader("Authorization", "Bearer TOKEN")
                    .UsingPut()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.ModifyWithInlinePathAsync(
            new ModifyResourceAtInlinedPath { Param = "param", Body = "string" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
