using System.Text.Json.Serialization;

namespace SeedValidation;

public class Type
{
    [JsonPropertyName("decimal")]
    public double Decimal { get; init; }

    [JsonPropertyName("even")]
    public int Even { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
