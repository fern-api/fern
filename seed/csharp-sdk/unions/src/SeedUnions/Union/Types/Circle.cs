using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public class Circle
{
    [JsonPropertyName("radius")]
    public double Radius { get; init; }
}
