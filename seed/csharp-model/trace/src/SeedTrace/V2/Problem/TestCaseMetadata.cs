using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2;

public record TestCaseMetadata
{
    [JsonPropertyName("id")]
    public required string Id { get; init; }

    [JsonPropertyName("name")]
    public required string Name { get; init; }

    [JsonPropertyName("hidden")]
    public required bool Hidden { get; init; }
}
