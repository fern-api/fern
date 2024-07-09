using System.Text.Json.Serialization;

#nullable enable

namespace SeedValidation;

public class CreateRequest
{
    [JsonPropertyName("decimal")]
    public double Decimal { get; init; }

    [JsonPropertyName("even")]
    public int Even { get; init; }

    [JsonPropertyName("name")]
    public string Name { get; init; }
}
