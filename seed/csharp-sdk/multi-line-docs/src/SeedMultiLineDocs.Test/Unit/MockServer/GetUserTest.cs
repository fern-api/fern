using NUnit.Framework;
using SeedMultiLineDocs.Test.Unit.MockServer;

#nullable enable

namespace SeedMultiLineDocs.Test;

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
