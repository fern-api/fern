using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedVersion.Core;
using SeedVersion.Test.Wire;

#nullable enable

namespace SeedVersion.Test;

[TestFixture]
public class GetUserTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            {
              "id": "string",
              "name": "string"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/string").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetUserAsync("string", RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
