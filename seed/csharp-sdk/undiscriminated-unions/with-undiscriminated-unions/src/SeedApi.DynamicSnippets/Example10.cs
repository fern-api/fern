using SeedUndiscriminatedUnions;

namespace Usage;

public class Example10
{
    public async Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.TestCamelCasePropertiesAsync(
            new PaymentRequest {
                PaymentMethod = new TokenizeCard {
                    Method = "method",
                    CardNumber = "cardNumber"
                }
            }
        );
    }

}
