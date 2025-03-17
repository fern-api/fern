using global::System.Threading.Tasks;
using SeedTrace;

namespace Usage;

public class Example11
{
    public async global::System.Threading.Tasks.Task Do() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions{
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Migration.GetAttemptedMigrationsAsync(
            new GetAttemptedMigrationsRequest{
                AdminKeyHeader = "admin-key-header"
            }
        );
    }

}
