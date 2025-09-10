using System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

[Serializable]
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

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
