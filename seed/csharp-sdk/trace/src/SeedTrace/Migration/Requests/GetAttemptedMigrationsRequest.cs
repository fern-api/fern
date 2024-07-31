namespace SeedTrace;

public record GetAttemptedMigrationsRequest
{
    public required string AdminKeyHeader { get; set; }
}
