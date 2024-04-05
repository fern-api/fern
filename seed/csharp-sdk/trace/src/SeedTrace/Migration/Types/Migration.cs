using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class Migration
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("status")]
    public MigrationStatus Status { get; init; }
}
