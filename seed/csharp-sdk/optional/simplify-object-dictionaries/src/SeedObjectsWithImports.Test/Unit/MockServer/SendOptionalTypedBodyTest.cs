using NUnit.Framework;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test.Unit.MockServer;

[TestFixture]
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
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
