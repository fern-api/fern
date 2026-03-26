using NUnit.Framework;
using SeedNoEnvironment.Test.Unit.MockServer;
using SeedNoEnvironment.Test.Utils;

namespace SeedNoEnvironment.Test.Unit.MockServer.Dummy;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetDummyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/dummy")
                    .WithHeader("Authorization", "Bearer TOKEN")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Dummy.GetDummyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
