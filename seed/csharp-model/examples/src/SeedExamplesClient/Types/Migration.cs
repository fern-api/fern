using System.Text.Json.Serialization;
using StringEnum;
using SeedExamplesClient;

namespace SeedExamplesClient;

public class Migration
{
    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("status")]
    public StringEnum<MigrationStatus> Status { get; init; }
}
