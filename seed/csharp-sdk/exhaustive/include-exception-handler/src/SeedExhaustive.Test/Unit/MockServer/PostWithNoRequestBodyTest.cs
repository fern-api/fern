using NUnit.Framework;
using SeedExhaustive.Test.Utils;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class PostWithNoRequestBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/no-req-body").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.NoReqBody.PostWithNoRequestBodyAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
