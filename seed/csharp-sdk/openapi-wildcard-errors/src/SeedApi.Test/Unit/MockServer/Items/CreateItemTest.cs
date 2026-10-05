using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Items;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class CreateItemTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/items")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Items.CreateItemAsync(new CreateItemRequest { Name = "name" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsClientRequestError()
    {
        const string requestJson = """
            {
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/items")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(400)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<ClientRequestError>(async () =>
            await Client.Items.CreateItemAsync(new CreateItemRequest { Name = "name" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsServerError()
    {
        const string requestJson = """
            {
              "name": "name"
            }
            """;

        const string mockResponse = """
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/items")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(500)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<ServerError>(async () =>
            await Client.Items.CreateItemAsync(new CreateItemRequest { Name = "name" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(500));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
