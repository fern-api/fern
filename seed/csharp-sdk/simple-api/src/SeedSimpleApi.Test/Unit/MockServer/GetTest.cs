using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedSimpleApi;
using SeedSimpleApi.Core;

namespace SeedSimpleApi.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "id",
              "name": "name",
              "email": "email"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetAsync("id");
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<User>(mockResponse)).UsingDefaults()
        );
    }
}
