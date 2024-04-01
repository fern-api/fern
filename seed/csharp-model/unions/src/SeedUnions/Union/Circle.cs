using System.Text.Json.Serialization;

namespace SeedUnions;

public class Circle
{
    [JsonPropertyName("radius")]
    public double Radius { get; init; }
}
