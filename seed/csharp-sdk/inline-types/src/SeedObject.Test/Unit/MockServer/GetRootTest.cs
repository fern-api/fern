using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedObject;
using SeedObject.Core;

#nullable enable

namespace SeedObject.Test.Unit.MockServer;

[TestFixture]
public class GetRootTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "bar": {
                "foo": "foo",
                "bar": {
                  "foo": "foo",
                  "bar": "bar",
                  "myEnum": "SUNNY"
                }
              },
              "foo": "foo"
            }
            """;

        const string mockResponse = """
            {
              "foo": "foo",
              "bar": {
                "foo": "foo",
                "bar": {
                  "foo": "foo",
                  "bar": "bar",
                  "myEnum": "SUNNY"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/root/root")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetRootAsync(
            new PostRootRequest
            {
                Bar = new InlineType1
                {
                    Foo = "foo",
                    Bar = new NestedInlineType1
                    {
                        Foo = "foo",
                        Bar = "bar",
                        MyEnum = InlineEnum.Sunny,
                    },
                },
                Foo = "foo",
            },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
