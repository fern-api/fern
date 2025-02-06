using SeedTrace.Core;

namespace SeedTrace;

public record GetAttemptedMigrationsRequest
{
    public required string AdminKeyHeader { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
