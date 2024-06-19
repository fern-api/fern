using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace.V2.V3;

public class TestCaseMetadata
{
    [JsonPropertyName("id")]
    public string Id { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }

    [JsonPropertyName("hidden")]
    public bool Hidden { get; init; }
}
