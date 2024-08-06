using NUnit.Framework;
using SeedUndiscriminatedUnions.Core;
using SeedUndiscriminatedUnions.Test.Utils;
using SeedUndiscriminatedUnions.Test.Wire;

#nullable enable

namespace SeedUndiscriminatedUnions.Test;

[TestFixture]
public class GetTest : BaseWireTest
{
    [Test]
    public void WireTest()
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
                    .WithPath("/")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.Union.GetAsync("string").Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
