using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnMapOfDocumentedUnknownTypeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "string": {
                "key": "value"
              }
            }
            """;

        const string mockResponse = """
            {
              "string": {
                "key": "value"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-map-of-documented-unknown-type")
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

        var response = await Client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownTypeAsync(
            new Dictionary<string, object>()
            {
                {
                    "string",
                    new Dictionary<object, object?>() { { "key", "value" } }
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "key": {
                "key": "value"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-map-of-documented-unknown-type")
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

        var response = await Client.Endpoints.Object.GetAndReturnMapOfDocumentedUnknownTypeAsync(
            new Dictionary<string, object>() { }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
