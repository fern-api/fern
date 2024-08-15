using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class ModifyWithPathTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
    {
        const string requestJson = """
            "string"
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params/path/string")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.ModifyWithPathAsync(
            "string",
            "string",
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
