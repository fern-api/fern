using global::System.Threading.Tasks;
using SeedUndiscriminatedUnions;

namespace Usage;

public class Example5
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedUndiscriminatedUnionsClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Union.DuplicateTypesUnionAsync(
            "string"
        );
    }

}
