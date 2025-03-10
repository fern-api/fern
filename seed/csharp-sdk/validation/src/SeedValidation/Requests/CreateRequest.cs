using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

public record CreateRequest
{
    [JsonPropertyName("decimal")]
    public required double Decimal { get; set; }

    [JsonPropertyName("even")]
    public required int Even { get; set; }

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("shape")]
    public required Shape Shape { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
