using NUnit.Framework;
using SeedVariables.Test.Wire;

#nullable enable

namespace SeedVariables.Test;

[TestFixture]
public class PostTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/string").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Service.PostAsync("string", RequestOptions)
        );
    }
}
