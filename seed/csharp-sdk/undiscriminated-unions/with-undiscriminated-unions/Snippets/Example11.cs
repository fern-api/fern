using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.TestCamelCasePropertiesAsync(
            new PaymentRequest {
                PaymentMethod = new TokenizeCard {
                    Method = "card",
                    CardNumber = "1234567890123456"
                }
            }
        );
    }

}
