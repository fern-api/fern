using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.InlinedRequests;
using SeedExhaustive.Types.Object;

#nullable enable

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class PostWithObjectBodyandResponseTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "string": "string",
              "integer": 1,
              "NestedObject": {}
            }
            """;

        const string mockResponse = """
            {}
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/req-bodies/object")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.InlinedRequests.PostWithObjectBodyandResponseAsync(
            new PostWithObjectBody
            {
                String = "string",
                Integer = 1,
                NestedObject = new ObjectWithOptionalField
                {
                    String = null,
                    Integer = null,
                    Long = null,
                    Double = null,
                    Bool = null,
                    Datetime = null,
                    Date = null,
                    Uuid = null,
                    Base64 = null,
                    List = null,
                    Set = null,
                    Map = null,
                    Bigint = null,
                },
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
