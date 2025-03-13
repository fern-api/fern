using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetAttemptedMigrationsRequest
{
    [JsonIgnore]
    public required string AdminKeyHeader { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
