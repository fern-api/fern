using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsContainer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsContainerGetAndReturnSetOfObjectsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithPath("/container/set-of-objects")
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
            await Client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfObjectsAsync(
                new List<TypesObjectWithRequiredField>()
                {
                    new TypesObjectWithRequiredField { String = "string" },
                    new TypesObjectWithRequiredField { String = "string" },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            [
              {
                "string": "string"
              }
            ]
            """;

        const string mockResponse = """
            [
              {
                "string": "string"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/set-of-objects")
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
            await Client.EndpointsContainer.EndpointsContainerGetAndReturnSetOfObjectsAsync(
                new List<TypesObjectWithRequiredField>()
                {
                    new TypesObjectWithRequiredField { String = "string" },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
