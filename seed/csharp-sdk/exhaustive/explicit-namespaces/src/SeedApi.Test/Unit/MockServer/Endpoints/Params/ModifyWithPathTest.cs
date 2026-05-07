using NUnit.Framework;
using SeedApi.Endpoints.Params;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Endpoints.Params;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class ModifyWithPathTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.ModifyWithPathAsync(
            new ModifyWithPathParamsRequest { Param = "param", Body = "string" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.ModifyWithPathAsync(
            new ModifyWithPathParamsRequest { Param = "param", Body = "string" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
