using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Container;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnListOfObjectsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            [
              {
                "string": "string"
              },
              {
                "string": "string"
              }
            ]
            """;

        const string mockResponse = """
            [
              {
                "string": "string"
              },
              {
                "string": "string"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/list-of-objects")
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

        var response = await Client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
            new List<ObjectWithRequiredField>()
            {
                new ObjectWithRequiredField { String = "string" },
                new ObjectWithRequiredField { String = "string" },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
