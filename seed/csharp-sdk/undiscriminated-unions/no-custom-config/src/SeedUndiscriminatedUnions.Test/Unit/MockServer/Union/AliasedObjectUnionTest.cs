using NUnit.Framework;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Test.Unit.MockServer;
using SeedUndiscriminatedUnions.Test.Utils;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer.Union;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class AliasedObjectUnionTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "onlyInA": "onlyInA",
              "sharedNumber": 1
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/aliased-object")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.AliasedObjectUnionAsync(
            new LeafObjectA { OnlyInA = "onlyInA", SharedNumber = 1 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
