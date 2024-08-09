using System.Text.Json.Serialization;

#nullable enable

namespace SeedUnions;

public record Circle
{
    [JsonPropertyName("radius")]
    public required double Radius { get; set; }
}
