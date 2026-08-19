using SeedTrace;

public partial class Examples
{
    public async Task Example11() {
        var client = new SeedTraceClient(
            token: "<token>",
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.Migration.GetAttemptedMigrationsAsync(
            new GetAttemptedMigrationsRequest {
                AdminKeyHeader = "admin-key-header"
            }
        );
    }

}
