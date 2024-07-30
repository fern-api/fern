using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public record Square
{
    [JsonPropertyName("length")]
    public required double Length { get; set; }
}
