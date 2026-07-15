using SeedCsharpUnionBaseProperties;

public partial class Examples
{
    public async Task Example1() {
        var client = new SeedCsharpUnionBasePropertiesClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.CreateAsync(
            new Shape(
                new Circle {
                    Radius = 1.1
                }
            ) {
                Id = "id",CreatedAt = "createdAt",
            }
        );
    }

}
