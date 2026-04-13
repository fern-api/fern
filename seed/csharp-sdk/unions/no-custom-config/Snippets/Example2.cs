using SeedApi;

public partial class Examples
{
    public async Task Example2() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Bigunion.UpdateAsync(
            new BigUnionZero {
                Value = "value",
                Type = BigUnionZeroType.NormalSweet
            }
        );
    }

}
