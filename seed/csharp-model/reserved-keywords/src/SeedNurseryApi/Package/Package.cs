using System.Text.Json.Serialization;

#nullable enable

namespace SeedNurseryApi;

public record Package
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }
}
