using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnMapOfDocumentedUnknownTypeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
                    .WithHeader("Authorization", "Bearer TOKEN")
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
}
