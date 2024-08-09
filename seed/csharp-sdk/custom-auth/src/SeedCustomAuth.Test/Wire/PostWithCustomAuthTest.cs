using NUnit.Framework;
using SeedCustomAuth.Core;
using SeedCustomAuth.Test.Utils;
using SeedCustomAuth.Test.Wire;

#nullable enable

namespace SeedCustomAuth.Test;

[TestFixture]
public class PostWithCustomAuthTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/custom-auth")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .CustomAuth.PostWithCustomAuthAsync(
                new Dictionary<object, object?>() { { "key", "value" }, }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
