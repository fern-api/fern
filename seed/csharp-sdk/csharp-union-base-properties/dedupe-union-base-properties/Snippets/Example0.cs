using SeedCsharpUnionBaseProperties;

public partial class Examples
{
    public async Task Example0() {
        var client = new SeedCsharpUnionBasePropertiesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateAsync(
            new Shape(
                new Circle {
                    Radius = 1.5
                }
            ) {
                Id = "shape-1",CreatedAt = "2024-01-01T00:00:00Z",
            }
        );
    }

}
