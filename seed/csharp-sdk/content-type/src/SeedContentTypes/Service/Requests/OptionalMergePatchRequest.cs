using System.Text.Json.Serialization;
using SeedContentTypes.Core;

namespace SeedContentTypes;

[Serializable]
public record OptionalMergePatchRequest
{
    [JsonPropertyName("requiredField")]
    public required string RequiredField { get; set; }

    [Optional]
    [JsonPropertyName("optionalString")]
    public string? OptionalString { get; set; }

    [Optional]
    [JsonPropertyName("optionalInteger")]
    public int? OptionalInteger { get; set; }

    [Optional]
    [JsonPropertyName("optionalBoolean")]
    public bool? OptionalBoolean { get; set; }

    [Nullable]
    [JsonPropertyName("nullableString")]
    public string? NullableString { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
