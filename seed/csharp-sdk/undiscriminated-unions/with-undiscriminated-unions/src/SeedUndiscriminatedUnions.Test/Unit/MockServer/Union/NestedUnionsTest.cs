using NUnit.Framework;
using SeedUndiscriminatedUnions.Test.Unit.MockServer;
using SeedUndiscriminatedUnions.Test.Utils;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer.Union;

[TestFixture]
public class NestedUnionsTest : BaseMockServerTest
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
                    .WithPath("/nested")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.NestedUnionsAsync("string");
        JsonAssert.AreEqual(response, mockResponse);
    }
}
