using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.TestGroup;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class TestMethodNameTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsUnprocessableEntityError()
    {
        const string requestJson = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
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
                    .WithStatusCode(422)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<UnprocessableEntityError>(async () =>
            await Client.TestGroup.TestMethodNameAsync(
                new TestMethodNameTestGroupRequest
                {
                    PathParam = "path_param",
                    QueryParamObject = new PlainObject { Id = "id", Name = "name" },
                    QueryParamInteger = 1,
                    Body = new PlainObject { Id = "id", Name = "name" },
                }
            )
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(422));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
