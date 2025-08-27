using global::System.Threading.Tasks;
using SeedNullableOptional;

namespace Usage;

public class Example6
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableOptionalClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.NullableOptional.GetComplexProfileAsync(
            "profileId"
        );
    }

}
