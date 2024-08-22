using NUnit.Framework;
using SeedObjectsWithImports.Core;
using SeedObjectsWithImports.Test.Utils;
using SeedObjectsWithImports.Test.Wire;

#nullable enable

namespace SeedObjectsWithImports.Test;

[TestFixture]
public class SendOptionalBodyTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "string": {
                "key": "value"
              }
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/send-optional-body")
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
            .Optional.SendOptionalBodyAsync(
                new Dictionary<string, object>()
                {
                    {
                        "string",
                        new Dictionary<object, object?>() { { "key", "value" }, }
                    },
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
