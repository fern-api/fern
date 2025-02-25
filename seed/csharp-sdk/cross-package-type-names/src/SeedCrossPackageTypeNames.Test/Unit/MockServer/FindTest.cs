using FluentAssertions.Json;
using global::System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedCrossPackageTypeNames;
using SeedCrossPackageTypeNames.Core;

namespace SeedCrossPackageTypeNames.Test.Unit.MockServer;

[TestFixture]
public class FindTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "publicProperty": "publicProperty",
              "privateProperty": 1
            }
            """;

        const string mockResponse = """
            {
              "imported": "imported"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("optionalString", "optionalString")
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
                OptionalString = "optionalString",
                PublicProperty = "publicProperty",
                PrivateProperty = 1,
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
