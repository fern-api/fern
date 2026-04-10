using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsObject;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsObjectGetAndReturnWithDocumentedUnknownTypeTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "documentedUnknownType": {
                "key": "value"
              }
            }
            """;

        const string mockResponse = """
            {
              "documentedUnknownType": {
                "key": "value"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/object/get-and-return-with-documented-unknown-type")
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

        var response =
            await Client.EndpointsObject.EndpointsObjectGetAndReturnWithDocumentedUnknownTypeAsync(
                new TypesObjectWithDocumentedUnknownType
                {
                    DocumentedUnknownType = new Dictionary<object, object?>()
                    {
                        { "key", "value" },
                    },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
