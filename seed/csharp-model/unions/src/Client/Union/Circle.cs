using System.Text.Json.Serialization;

namespace Client;

public class Circle
{
    [JsonPropertyName("radius")]
    public double Radius { get; init; }
}
