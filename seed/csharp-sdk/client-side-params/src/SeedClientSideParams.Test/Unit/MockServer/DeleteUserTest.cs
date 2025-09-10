using NUnit.Framework;

namespace SeedClientSideParams.Test.Unit.MockServer;

[TestFixture]
public class DeleteUserTest : BaseMockServerTest
{
    [Test]
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
