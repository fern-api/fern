using NUnit.Framework;
using SeedPackageYml;
using SeedPackageYml.Core;
using SeedPackageYml.Test.Utils;
using SeedPackageYml.Test.Wire;

#nullable enable

namespace SeedPackageYml.Test;

[TestFixture]
public class EchoTest : BaseWireTest
{
    [Test]
    public void WireTest_1()
    {
        const string requestJson = """
            {
              "name": "Hello world!",
              "size": 20
            }
            """;

        const string mockResponse = """
            "Hello world!"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/string/")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = Client
            .EchoAsync("string", new EchoRequest { Name = "Hello world!", Size = 20 })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }

    [Test]
    public void WireTest_2()
    {
        const string requestJson = """
            {
              "name": "Hello world!",
              "size": 20
            }
            """;

        const string mockResponse = """
            "Hello world!"
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

        var response = Client
            .EchoAsync("id-ksfd9c1", new EchoRequest { Name = "Hello world!", Size = 20 })
            .Result;
        JsonDiffChecker.AssertJsonEquals(mockResponse, JsonUtils.Serialize(response));
    }
}
