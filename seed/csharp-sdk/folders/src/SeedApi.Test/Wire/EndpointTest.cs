using NUnit.Framework;
using SeedApi.Test.Wire;

#nullable enable

namespace SeedApi.Test;

[TestFixture]
public class EndpointTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/service").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Folder.Service.EndpointAsync(RequestOptions)
        );
    }
}
