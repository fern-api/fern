using global::System.Threading.Tasks;
using SeedNullable;
using SeedNullable.Core;

namespace Usage;

public class Example2
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedNullableClient(
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Nullable.DeleteUserAsync(
            new DeleteUserRequest{
                Username = "xy"
            }
        );
    }

}
