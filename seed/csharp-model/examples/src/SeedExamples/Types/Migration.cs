using System.Text.Json.Serialization;
using SeedExamples;

#nullable enable

namespace SeedExamples;

public record Migration
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("status")]
    public required MigrationStatus Status { get; set; }
}
