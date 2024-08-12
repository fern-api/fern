using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedAuthEnvironmentVariables;
using SeedAuthEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedAuthEnvironmentVariables.Test;

[TestFixture]
public class GetWithHeaderTest : BaseWireTest
{
    [Test]
    public void WireTest()
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

        var response = Client
            .Service.GetWithHeaderAsync(new HeaderAuthRequest { XEndpointHeader = "string" })
            .Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
