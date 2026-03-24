using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Test.Unit.MockServer;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test.Unit.MockServer.Optional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendOptionalTypedBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "message": "message"
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/send-optional-typed-body")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Optional.SendOptionalTypedBodyAsync(
            new SendOptionalBodyRequest { Message = "message" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
