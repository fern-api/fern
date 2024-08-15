using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedBearerTokenEnvironmentVariable.Core;
using SeedBearerTokenEnvironmentVariable.Test.Wire;

#nullable enable

namespace SeedBearerTokenEnvironmentVariable.Test;

[TestFixture]
public class GetWithBearerTokenTest : BaseWireTest
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

        var response = await Client.Service.GetWithBearerTokenAsync(RequestOptions);
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
