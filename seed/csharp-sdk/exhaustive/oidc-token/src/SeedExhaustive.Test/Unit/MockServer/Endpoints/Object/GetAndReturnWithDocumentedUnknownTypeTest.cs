using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Object;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnWithDocumentedUnknownTypeTest : BaseMockServerTest
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
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Object.GetAndReturnWithDocumentedUnknownTypeAsync(
            new ObjectWithDocumentedUnknownType
            {
                DocumentedUnknownType = new Dictionary<object, object?>() { { "key", "value" } },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
