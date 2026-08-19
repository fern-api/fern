using NUnit.Framework;
using SeedObject;
using SeedObject.Test.Utils;

namespace SeedObject.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetRootTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "bar": {
                "foo": "foo"
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
                  "myEnum": "SUNNY",
                  "ref": {
                    "foo": "foo"
                  }
                },
                "ref": {
                  "foo": "foo"
                }
              },
              "fooMap": {
                "fooMap": {
                  "foo": "foo",
                  "ref": {
                    "foo": "foo"
                  }
                }
              },
              "fooList": [
                {
                  "foo": "foo",
                  "ref": {
                    "foo": "foo"
                  }
                },
                {
                  "foo": "foo",
                  "ref": {
                    "foo": "foo"
                  }
                }
              ],
              "fooSet": [
                {
                  "foo": "foo",
                  "ref": {
                    "foo": "foo"
                  }
                }
              ],
              "ref": {
                "foo": "foo"
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
                Bar = new RequestTypeInlineType1 { Foo = "foo" },
                Foo = "foo",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
