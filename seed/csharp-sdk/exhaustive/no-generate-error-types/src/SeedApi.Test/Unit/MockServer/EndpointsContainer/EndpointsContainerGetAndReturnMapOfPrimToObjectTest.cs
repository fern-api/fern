using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsContainer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsContainerGetAndReturnMapOfPrimToObjectTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "string": {
                "string": "string"
              }
            }
            """;

        const string mockResponse = """
            {
              "string": {
                "string": "string"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-object")
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
            await Client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
                new Dictionary<string, TypesObjectWithRequiredField>()
                {
                    {
                        "string",
                        new TypesObjectWithRequiredField { String = "string" }
                    },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "key": {
                "string": "string"
              }
            }
            """;

        const string mockResponse = """
            {
              "key": {
                "string": "string"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-object")
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
            await Client.EndpointsContainer.EndpointsContainerGetAndReturnMapOfPrimToObjectAsync(
                new Dictionary<string, TypesObjectWithRequiredField>()
                {
                    {
                        "key",
                        new TypesObjectWithRequiredField { String = "string" }
                    },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
