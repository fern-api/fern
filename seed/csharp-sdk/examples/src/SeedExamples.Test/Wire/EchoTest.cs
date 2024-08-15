using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class EchoTest : BaseWireTest
{
    [Test]
    public async Task WireTest_1()
    {
        const string requestJson = """
            "Hello world!\\n\\nwith\\n\\tnewlines"
            """;

        const string mockResponse = """
            "Hello world!\\n\\nwith\\n\\tnewlines"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EchoAsync(
            "Hello world!\\n\\nwith\\n\\tnewlines",
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

    [Test]
    public async Task WireTest_2()
    {
        const string requestJson = """
            "Hello world!\\n\\nwith\\n\\tnewlines"
            """;

        const string mockResponse = """
            "Hello world!\\n\\nwith\\n\\tnewlines"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EchoAsync(
            "Hello world!\\n\\nwith\\n\\tnewlines",
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
