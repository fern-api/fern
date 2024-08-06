using NUnit.Framework;
using SeedExamples.Core;
using SeedExamples.Test.Utils;
using SeedExamples.Test.Wire;

#nullable enable

namespace SeedExamples.Test;

[TestFixture]
public class EchoTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines").Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
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
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client.EchoAsync("Hello world!\\n\\nwith\\n\\tnewlines").Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
