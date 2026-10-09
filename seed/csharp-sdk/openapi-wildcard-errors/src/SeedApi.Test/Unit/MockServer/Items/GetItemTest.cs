using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Items;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetItemTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/items/item_id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Items.GetItemAsync(new GetItemRequest { ItemId = "item_id" });
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsNotFoundError()
    {
        const string mockResponse = """
            {
              "item_id": "item_id"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/items/item_id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(404)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<NotFoundError>(async () =>
            await Client.Items.GetItemAsync(new GetItemRequest { ItemId = "item_id" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(404));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsClientRequestError()
    {
        const string mockResponse = """
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/items/item_id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(400)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<ClientRequestError>(async () =>
            await Client.Items.GetItemAsync(new GetItemRequest { ItemId = "item_id" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(400));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }

    [NUnit.Framework.Test]
    public void MockServerTest_ThrowsServerError()
    {
        const string mockResponse = """
            {
              "error_type": "error_type",
              "error_code": "error_code",
              "error_message": "error_message",
              "request_id": "request_id"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/items/item_id").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(500)
                    .WithBody(mockResponse)
            );

        var exception = Assert.ThrowsAsync<ServerError>(async () =>
            await Client.Items.GetItemAsync(new GetItemRequest { ItemId = "item_id" })
        )!;
        Assert.That(exception.StatusCode, Is.EqualTo(500));
        JsonAssert.AreEqual(exception.Body, mockResponse);
    }
}
