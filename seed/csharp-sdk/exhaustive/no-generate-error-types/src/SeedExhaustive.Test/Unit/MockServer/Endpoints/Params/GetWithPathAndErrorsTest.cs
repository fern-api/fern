using NUnit.Framework;
using SeedExhaustive;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithPathAndErrorsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/params/path/param").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.GetWithPathAndErrorsAsync("param");
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsBadRequestBody()
    {
        const string mockResponse = """
            {
              "message": "message"
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/params/path/param").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(400)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<SeedExhaustiveApiException>(async () =>
            await Client.Endpoints.Params.GetWithPathAndErrorsAsync("param")
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
        Assert.That(exception.Body, Is.EqualTo(mockResponse));
    }
}
