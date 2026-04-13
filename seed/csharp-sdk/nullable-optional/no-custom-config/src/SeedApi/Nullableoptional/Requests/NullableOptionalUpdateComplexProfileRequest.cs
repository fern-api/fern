using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalUpdateComplexProfileRequest
{
    [JsonIgnore]
    public required string ProfileId { get; set; }

    [JsonPropertyName("nullableRole")]
    public UserRole? NullableRole { get; set; }

    [JsonPropertyName("nullableStatus")]
    public UserStatus? NullableStatus { get; set; }

    [JsonPropertyName("nullableNotification")]
    public OneOf<
        NotificationMethodZero,
        NotificationMethodOne,
        NotificationMethodTwo
    >? NullableNotification { get; set; }

    [JsonPropertyName("nullableSearchResult")]
    public OneOf<
        SearchResultZero,
        SearchResultOne,
        SearchResultTwo
    >? NullableSearchResult { get; set; }

    [JsonPropertyName("nullableArray")]
    public IEnumerable<string>? NullableArray { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
