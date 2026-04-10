using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalUpdateTagsRequest
{
    [JsonIgnore]
    public required string UserId { get; set; }

    [Nullable]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("categories")]
    public Optional<IEnumerable<string>?> Categories { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("labels")]
    public Optional<IEnumerable<string>?> Labels { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
