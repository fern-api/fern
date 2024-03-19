using System.Text.Json.Serialization

namespace SeedUnionsClient

public class Circle
{
    [JsonPropertyName("radius")]
    public double Radius { get; init; }
}
