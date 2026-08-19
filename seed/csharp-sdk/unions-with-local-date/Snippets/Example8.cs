using SeedUnions;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedUnionsClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.UpdateAsync(
            new UnionWithTime(
                new UnionWithTime.ValueInner()
            )
        );
    }

}
