using System.Text.Json.Serialization
using StringEnum
using SeedTraceClient

namespace SeedTraceClient

public class Migration
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("status")]
    public StringEnum<MigrationStatus> Status { get; init; }
}
