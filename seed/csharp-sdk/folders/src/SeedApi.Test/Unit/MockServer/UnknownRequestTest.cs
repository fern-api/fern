using NUnit.Framework;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class UnknownRequestTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/service")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Folder.Service.UnknownRequestAsync(
                    new Dictionary<object, object?>() { { "key", "value" } },
                    RequestOptions
                )
        );
    }
}
