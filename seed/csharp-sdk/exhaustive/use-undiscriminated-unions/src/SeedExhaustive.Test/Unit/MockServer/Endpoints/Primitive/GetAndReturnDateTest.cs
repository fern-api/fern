using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Primitive;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnDateTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            "2023-01-15"
            """;

        const string mockResponse = """
            "2023-01-15"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/date")
                    .WithHeader("Authorization", "Bearer TOKEN")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnDateAsync(
            new DateOnly(2023, 1, 15)
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
