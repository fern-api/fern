using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalUpdateComplexProfileRequest
{
    [JsonIgnore]
    public required string ProfileId { get; set; }

    [Optional]
    [JsonPropertyName("nullableRole")]
    public UserRole? NullableRole { get; set; }

    [Optional]
    [JsonPropertyName("nullableStatus")]
    public UserStatus? NullableStatus { get; set; }

    [Optional]
    [JsonPropertyName("nullableNotification")]
    public OneOf<
        NotificationMethodZero,
        NotificationMethodOne,
        NotificationMethodTwo
    >? NullableNotification { get; set; }

    [Optional]
    [JsonPropertyName("nullableSearchResult")]
    public OneOf<
        SearchResultZero,
        SearchResultOne,
        SearchResultTwo
    >? NullableSearchResult { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullableArray")]
    public Optional<IEnumerable<string>?> NullableArray { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
