using NUnit.Framework;
using System.Threading.Tasks;
using SeedNullable;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedNullable.Core;

    namespace SeedNullable.Test.Unit.MockServer;

[TestFixture]
public class DeleteUserTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        {
          "username": "xy"
        }
        """;

        const string mockResponse = """
        true
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingDelete().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Nullable.DeleteUserAsync(new DeleteUserRequest{ 
                Username = "xy"
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
