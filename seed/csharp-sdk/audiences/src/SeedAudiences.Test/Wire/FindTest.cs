using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAudiences;
using SeedAudiences.Core;
using SeedAudiences.Test.Wire;

#nullable enable

namespace SeedAudiences.Test;

[TestFixture]
public class FindTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
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
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Foo.FindAsync(
            new FindRequest
            {
                OptionalString = "string",
                PublicProperty = "string",
                PrivateProperty = 1
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
