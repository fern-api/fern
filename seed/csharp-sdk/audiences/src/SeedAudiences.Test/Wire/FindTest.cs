using NUnit.Framework;
using SeedAudiences;
using SeedAudiences.Core;
using SeedAudiences.Test.Utils;
using SeedAudiences.Test.Wire;

#nullable enable

namespace SeedAudiences.Test;

[TestFixture]
public class FindTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            {
              "publicProperty": "string",
              "privateProperty": 1
            }
            """;

        const string mockResponse = """
            {
              "imported": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("optionalString", "string")
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
            .Foo.FindAsync(
                new FindRequest
                {
                    OptionalString = "string",
                    PublicProperty = "string",
                    PrivateProperty = 1
                }
            )
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
