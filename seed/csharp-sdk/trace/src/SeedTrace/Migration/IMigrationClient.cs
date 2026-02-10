namespace SeedTrace;

public partial interface IMigrationClient
{
    WithRawResponseTask<IEnumerable<Migration>> GetAttemptedMigrationsAsync(
        GetAttemptedMigrationsRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
