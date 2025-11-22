using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class TestMethodNameTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/optional-request-body/path_param")
                    .WithParam("query_param_integer", "1")
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

        var response = await Client.TestGroup.TestMethodNameAsync(
            new TestMethodNameTestGroupRequest
            {
                PathParam = "path_param",
                QueryParamObject = new PlainObject { Id = "id", Name = "name" },
                QueryParamInteger = 1,
                Body = new PlainObject { Id = "id", Name = "name" },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<object>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/optional-request-body/path_param")
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

        var response = await Client.TestGroup.TestMethodNameAsync(
            new TestMethodNameTestGroupRequest
            {
                PathParam = "path_param",
                Body = new PlainObject(),
            }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<object>(mockResponse)).UsingDefaults()
        );
    }
}
