using System.Text.Json.Serialization;

namespace Client;

public class Square
{
    [JsonPropertyName("length")]
    public double Length { get; init; }
}
