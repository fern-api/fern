using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public class Square
{
    [JsonPropertyName("length")]
    public double Length { get; init; }
}
