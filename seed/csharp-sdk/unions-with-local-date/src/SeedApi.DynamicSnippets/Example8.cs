using SeedUnions;

namespace Usage;

public class Example8
{
    public async Task Do() {
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
