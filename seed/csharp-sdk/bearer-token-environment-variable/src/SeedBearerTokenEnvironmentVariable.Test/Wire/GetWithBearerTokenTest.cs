using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedBearerTokenEnvironmentVariable.Test.Wire;

#nullable enable

namespace SeedBearerTokenEnvironmentVariable.Test;

[TestFixture]
public class GetWithBearerTokenTest : BaseWireTest
{
    [Test]
    public void WireTest()
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

        var response = Client.Service.GetWithBearerTokenAsync().Result;
        JToken.Parse(serializedJson).Should().BeEquivalentTo(JToken.Parse(response));
    }
}
