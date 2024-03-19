using System.Text.Json.Serialization

namespace SeedUnionsClient

public class Square
{
    [JsonPropertyName("length")]
    public double Length { get; init; }
}
