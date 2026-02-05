using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record UpdateComplexProfileRequest
{
    [Nullable, Optional]
    [JsonPropertyName("nullableRole")]
    public Optional<UserRole?> NullableRole { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullableStatus")]
    public Optional<UserStatus?> NullableStatus { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullableNotification")]
    public Optional<NotificationMethod?> NullableNotification { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullableSearchResult")]
    public Optional<SearchResult?> NullableSearchResult { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nullableArray")]
    public Optional<IEnumerable<string>?> NullableArray { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
