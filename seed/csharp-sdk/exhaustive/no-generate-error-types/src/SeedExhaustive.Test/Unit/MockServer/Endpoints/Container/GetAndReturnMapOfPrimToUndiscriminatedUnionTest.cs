using NUnit.Framework;
using OneOf;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Container;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnMapOfPrimToUndiscriminatedUnionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
}
