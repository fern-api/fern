using SeedValidation;

public partial class Examples
{
    public async Task Example1() {
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
