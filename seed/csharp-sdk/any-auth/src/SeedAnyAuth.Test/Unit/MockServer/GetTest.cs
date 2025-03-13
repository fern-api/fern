using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedAnyAuth;
using SeedAnyAuth.Core;

namespace SeedAnyAuth.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name"
              },
              {
                "id": "id",
                "name": "name"
              }
            ]
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingPost())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetAsync(RequestOptions);
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<User>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
