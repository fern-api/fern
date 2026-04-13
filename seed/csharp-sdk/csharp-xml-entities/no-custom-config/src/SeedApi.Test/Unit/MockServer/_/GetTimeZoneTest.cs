using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer._;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTimeZoneTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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

        var response = await Client._.GetTimeZoneAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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

        var response = await Client._.GetTimeZoneAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
