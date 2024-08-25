using NUnit.Framework;

#nullable enable

namespace SeedMultiLineDocs.Test.Unit.MockServer;

[TestFixture]
public class GetUserTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/string").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.User.GetUserAsync("string", RequestOptions)
        );
    }
}
