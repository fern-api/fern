using SeedValidation;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedValidationClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateAsync(
            new CreateRequest {
                Decimal = 2.2,
                Even = 100,
                Name = "fern",
                Shape = Shape.Square
            }
        );
    }

}
