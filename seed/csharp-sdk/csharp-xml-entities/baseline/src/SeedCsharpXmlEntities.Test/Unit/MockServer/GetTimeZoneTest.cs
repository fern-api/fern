using NUnit.Framework;
using SeedCsharpXmlEntities.Test.Utils;

namespace SeedCsharpXmlEntities.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTimeZoneTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "timeZoneOffset": "timeZoneOffset",
              "mathExpression": "mathExpression",
              "validEntity": "validEntity",
              "specialChars": "specialChars"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/timezone").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.GetTimeZoneAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
