using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public record TestCaseMetadata
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("hidden")]
    public required bool Hidden { get; set; }
}
