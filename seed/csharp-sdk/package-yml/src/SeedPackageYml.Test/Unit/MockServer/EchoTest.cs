using NUnit.Framework;
using SeedPackageYml;
using SeedPackageYml.Test.Utils;

namespace SeedPackageYml.Test.Unit.MockServer;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EchoTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "name": "name",
              "size": 1
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/id/")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EchoAsync("id", new EchoRequest { Name = "name", Size = 1 });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
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
                    .WithPath("/id-ksfd9c1/")
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
            "id-ksfd9c1",
            new EchoRequest { Name = "Hello world!", Size = 20 }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
