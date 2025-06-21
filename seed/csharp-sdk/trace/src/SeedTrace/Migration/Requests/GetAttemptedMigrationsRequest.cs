using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record GetAttemptedMigrationsRequest
{
    [JsonIgnore]
    public required string AdminKeyHeader { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
