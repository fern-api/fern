using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Nullableoptional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetnotificationsettingsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "type": "email",
              "emailAddress": "emailAddress",
              "subject": "subject",
              "htmlContent": "htmlContent"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/userId/notifications")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.GetnotificationsettingsAsync(
            new NullableOptionalGetNotificationSettingsRequest { UserId = "userId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "emailAddress": "emailAddress",
              "subject": "subject",
              "htmlContent": "htmlContent",
              "type": "email"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/userId/notifications")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Nullableoptional.GetnotificationsettingsAsync(
            new NullableOptionalGetNotificationSettingsRequest { UserId = "userId" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
