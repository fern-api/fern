using System.Text.Json.Serialization;

#nullable enable

namespace SeedApi;

public record ObjectFieldValue
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("value")]
    public required object Value { get; set; }
}
