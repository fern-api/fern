using SeedApi;
using System.Globalization;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreatePlantOrderAsync(
            new CreatePlantOrderRequest {
                PlantId = "plantId",
                Body = new PlantOrder {
                    PlantName = "plantName",
                    Quantity = 1,
                    OrderId = "orderId",
                    Amount = 1.1,
                    Currency = "currency",
                    DateTime = DateTime.Parse("2024-01-15T09:30:00Z", null, DateTimeStyles.AdjustToUniversal)
                }
            }
        );
    }

}
