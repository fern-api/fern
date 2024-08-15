using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAuthEnvironmentVariables;
using SeedAuthEnvironmentVariables.Core;
using SeedAuthEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedAuthEnvironmentVariables.Test;

[TestFixture]
public class GetWithHeaderTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/apiKeyInHeader")
                    .WithHeader("X-Endpoint-Header", "string")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Service.GetWithHeaderAsync(
            new HeaderAuthRequest { XEndpointHeader = "string" },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
