using NUnit.Framework;
using SeedVariables.Test.Unit.MockServer;

#nullable enable

namespace SeedVariables.Test;

[TestFixture]
public class PostTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/string").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Service.PostAsync("string", RequestOptions)
        );
    }
}
