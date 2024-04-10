using SeedTrace;

namespace SeedTrace;

public class MigrationClient
{
    private RawClient _client;

    public MigrationClient(RawClient client)
    {
        _client = client;
    }

    public async void GetAttemptedMigrationsAsync() { }
}
