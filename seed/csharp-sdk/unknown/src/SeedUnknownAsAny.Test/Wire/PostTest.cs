using NUnit.Framework;
using SeedUnknownAsAny.Core;
using SeedUnknownAsAny.Test.Utils;
using SeedUnknownAsAny.Test.Wire;

#nullable enable

namespace SeedUnknownAsAny.Test;

[TestFixture]
public class PostTest : BaseWireTest
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
            [
              {
                "key": "value"
              }
            ]
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

        var response = Client
            .Unknown.PostAsync(new Dictionary<object, object?>() { { "key", "value" }, })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
