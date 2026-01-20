using NUnit.Framework;
using SeedNullableOptional;
using SeedNullableOptional.Core;

namespace SeedNullableOptional.Test.Unit.MockServer;

[TestFixture]
public class GetNotificationSettingsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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

        var response = await Client.NullableOptional.GetNotificationSettingsAsync("userId");
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<NotificationMethod?>(mockResponse)).UsingDefaults()
        );
    }
}
