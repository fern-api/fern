using NUnit.Framework;

#nullable enable

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnOptionalTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """

            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/opt-objects")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Endpoints.Container.GetAndReturnOptionalAsync(null, RequestOptions)
        );
    }
}
