using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class Migration
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("status")]
    [JsonConverter(typeof(StringEnumSerializer<MigrationStatus>))]
    public MigrationStatus Status { get; init; }
}
