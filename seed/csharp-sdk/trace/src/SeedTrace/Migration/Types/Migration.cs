using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class Migration
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("status")]
    public MigrationStatus Status { get; init; }
}
