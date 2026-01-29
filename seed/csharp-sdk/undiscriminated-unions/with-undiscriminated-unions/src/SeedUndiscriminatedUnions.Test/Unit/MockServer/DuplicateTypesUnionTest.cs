using System.Text.Json;
using NUnit.Framework;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class DuplicateTypesUnionTest : BaseMockServerTest
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
                    .WithPath("/duplicate")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.DuplicateTypesUnionAsync("string");
        var actualJson = JsonUtils.SerializeToElement(response);
        var expectedJson = JsonUtils.Deserialize<JsonElement>(mockResponse);
        Assert.That(actualJson, Is.EqualTo(expectedJson).UsingJsonElementComparer());
    }
}
