using SeedUndiscriminatedUnions;

public partial class Examples
{
    public async Task Example10() {
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
