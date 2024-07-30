using System.Text.Json.Serialization;
using SeedExtends;

#nullable enable

namespace SeedExtends;

public record NestedType : Json
{
    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}

// A extends B, C
// A implements IB, IC