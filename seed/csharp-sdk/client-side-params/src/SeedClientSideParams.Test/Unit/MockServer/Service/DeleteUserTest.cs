using NUnit.Framework;
using SeedClientSideParams.Test.Unit.MockServer;

namespace SeedClientSideParams.Test.Unit.MockServer.Service;

[TestFixture]
public class DeleteUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/api/users/userId")
                    .UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.DeleteUserAsync("userId"));
    }
}
