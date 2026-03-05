using SeedApi;

namespace Usage;

public class Example0
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
                    OrderId = "orderId",
                    Amount = 1.1,
                    Currency = "currency",
                    PlantName = "plantName"
                }
            }
        );
    }

}
