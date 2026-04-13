using SeedApi;

namespace Usage;

public class Example9
{
    public async Task Do() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Types.UpdateAsync(
            new UnionWithTime(
                new UnionWithTimeValue {
                    Value = 1
                }
            )
        );
    }

}
