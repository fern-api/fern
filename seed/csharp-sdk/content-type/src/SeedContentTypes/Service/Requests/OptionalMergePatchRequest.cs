using System.Text.Json.Serialization;
using SeedContentTypes.Core;

namespace SeedContentTypes;

[Serializable]
public record OptionalMergePatchRequest
{
    [JsonPropertyName("requiredField")]
    public required string RequiredField { get; set; }

    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [JsonPropertyName("optionalInteger")]
    public int? OptionalInteger { get; set; }

    [JsonPropertyName("optionalBoolean")]
    public bool? OptionalBoolean { get; set; }

    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
