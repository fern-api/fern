using System.Text.Json.Serialization;
using SeedValidation;

#nullable enable

namespace SeedValidation;

public record Type
{
    [JsonPropertyName("decimal")]
    public required double Decimal { get; set; }

    [JsonPropertyName("even")]
    public required int Even { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("shape")]
    public required Shape Shape { get; set; }
}
