using NUnit.Framework;
using SeedCsharpXmlEntities;
using SeedCsharpXmlEntities.Core;

namespace SeedCsharpXmlEntities.Test.Unit.MockServer;

[TestFixture]
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
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<TimeZoneModel>(mockResponse)).UsingDefaults()
        );
    }
}
