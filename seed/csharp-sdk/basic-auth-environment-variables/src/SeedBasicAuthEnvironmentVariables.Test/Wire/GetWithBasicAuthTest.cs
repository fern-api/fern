using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables.Core;
using SeedBasicAuthEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables.Test;

[TestFixture]
public class GetWithBasicAuthTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.BasicAuth.GetWithBasicAuthAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
