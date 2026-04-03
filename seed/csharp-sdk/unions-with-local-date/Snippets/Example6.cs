using SeedUnions;

public partial class Examples
{
    public async Task Example6() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.UpdateAsync(
            new UnionWithTime(
                new UnionWithTime.Date(DateOnly.Parse("date"))
            )
        );
    }

}
