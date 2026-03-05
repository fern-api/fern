using System.Globalization;
using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer;

[TestFixture]
public class CreatePlantOrderTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "plantName": "plantName",
              "quantity": 1,
              "orderId": "orderId",
              "amount": 1.1,
              "currency": "currency",
              "dateTime": "2024-01-15T09:30:00.000Z"
            }
            """;

        const string mockResponse = """
            {
              "plantName": "plantName",
              "quantity": 1,
              "orderId": "orderId",
              "amount": 1.1,
              "currency": "currency",
              "dateTime": "2024-01-15T09:30:00.000Z"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/plants/plantId")
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

        var response = await Client.CreatePlantOrderAsync(
            new CreatePlantOrderRequest
            {
                PlantId = "plantId",
                Body = new PlantOrder
                {
                    PlantName = "plantName",
                    Quantity = 1,
                    OrderId = "orderId",
                    Amount = 1.1,
                    Currency = "currency",
                    DateTime = DateTime.Parse(
                        "2024-01-15T09:30:00.000Z",
                        null,
                        DateTimeStyles.AdjustToUniversal
                    ),
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "orderId": "orderId",
              "amount": 1.1,
              "currency": "currency",
              "plantName": "plantName"
            }
            """;

        const string mockResponse = """
            {
              "orderId": "orderId",
              "amount": 1.1,
              "currency": "currency",
              "dateTime": "2024-01-15T09:30:00.000Z",
              "plantName": "plantName",
              "quantity": 1
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/plants/plantId")
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

        var response = await Client.CreatePlantOrderAsync(
            new CreatePlantOrderRequest
            {
                PlantId = "plantId",
                Body = new PlantOrder
                {
                    OrderId = "orderId",
                    Amount = 1.1,
                    Currency = "currency",
                    PlantName = "plantName",
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
