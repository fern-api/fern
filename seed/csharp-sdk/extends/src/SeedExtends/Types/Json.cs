using System.Text.Json.Serialization;
using SeedExtends;

#nullable enable

namespace SeedExtends;

public record Json : Docs
{
    [JsonPropertyName("raw")]
    public required string Raw { get; set; }

    [JsonPropertyName("docs")]
    public required string Docs { get; set; }
}
