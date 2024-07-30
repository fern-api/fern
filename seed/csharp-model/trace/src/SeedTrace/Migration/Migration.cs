using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record Migration
{
    [JsonPropertyName("name")]
    public required string Name { get; }

    [JsonPropertyName("status")]
    public required MigrationStatus Status { get; }
}
