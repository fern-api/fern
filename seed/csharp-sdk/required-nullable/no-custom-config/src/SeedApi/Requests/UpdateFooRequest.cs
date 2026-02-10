using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UpdateFooRequest
{
    [JsonIgnore]
    public required string XIdempotencyKey { get; set; }

    /// <summary>
    /// Can be explicitly set to null to clear the value
    /// </summary>
    [JsonPropertyName("nullable_text")]
    public string? NullableText { get; set; }

    /// <summary>
    /// Can be explicitly set to null to clear the value
    /// </summary>
    [JsonPropertyName("nullable_number")]
    public double? NullableNumber { get; set; }

    /// <summary>
    /// Regular non-nullable field
    /// </summary>
    [JsonPropertyName("non_nullable_text")]
    public string? NonNullableText { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
