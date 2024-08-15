using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAuthEnvironmentVariables.Core;
using SeedAuthEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedAuthEnvironmentVariables.Test;

[TestFixture]
public class GetWithApiKeyTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/apiKey").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetWithApiKeyAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
