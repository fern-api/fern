using System.Threading.Tasks;
using NUnit.Framework;
using SeedApi;
using SeedApi.Core;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class SubmitFormDataTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "username": "username",
              "email": "email"
            }
            """;

        const string mockResponse = """
            {
              "status": "status",
              "message": "message"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/submit")
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SubmitFormDataAsync(
            new PostSubmitRequest { Username = "username", Email = "email" }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<PostSubmitResponse>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "username": "johndoe",
              "email": "john@example.com"
            }
            """;

        const string mockResponse = """
            {
              "status": "success",
              "message": "Data received successfully."
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/submit")
                    .WithHeader("Content-Type", "application/x-www-form-urlencoded")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.SubmitFormDataAsync(
            new PostSubmitRequest { Username = "johndoe", Email = "john@example.com" }
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<PostSubmitResponse>(mockResponse)).UsingDefaults()
        );
    }
}
