using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record UpdateComplexProfileRequest
{
    [JsonPropertyName("nullableRole")]
    public UserRole? NullableRole { get; set; }

    [JsonPropertyName("nullableStatus")]
    public UserStatus? NullableStatus { get; set; }

    [JsonPropertyName("nullableNotification")]
    public NotificationMethod? NullableNotification { get; set; }

    [JsonPropertyName("nullableSearchResult")]
    public SearchResult? NullableSearchResult { get; set; }

    [JsonPropertyName("nullableArray")]
    public IEnumerable<string>? NullableArray { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
