using NUnit.Framework;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Primitive;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetAndReturnDoubleTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            1.1
            """;

        const string mockResponse = """
            1.1
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/double")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnDoubleAsync(1.1);
        JsonAssert.AreEqual(response, mockResponse);
    }
}
