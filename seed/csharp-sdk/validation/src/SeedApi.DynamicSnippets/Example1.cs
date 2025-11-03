using SeedValidation;

namespace Usage;

public class Example1
{
    public async Task Do() {
        var client = new SeedValidationClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.GetAsync(
            new GetRequest {
                Decimal = 2.2,
                Even = 100,
                Name = "fern"
            }
        );
    }

}
