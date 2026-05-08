using NUnit.Framework;
using OneOf;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Endpoints.Container;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnMapOfPrimToUndiscriminatedUnionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "string": 1.1
            }
            """;

        const string mockResponse = """
            {
              "string": 1.1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-union")
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
            await Client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
                new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>()
                {
                    { "string", 1.1 },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "key": 1.1
            }
            """;

        const string mockResponse = """
            {
              "key": 1.1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-union")
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
            await Client.Endpoints.Container.GetAndReturnMapOfPrimToUndiscriminatedUnionAsync(
                new Dictionary<string, OneOf<double, bool, string, IEnumerable<string>>>()
                {
                    { "key", 1.1 },
                }
            );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
