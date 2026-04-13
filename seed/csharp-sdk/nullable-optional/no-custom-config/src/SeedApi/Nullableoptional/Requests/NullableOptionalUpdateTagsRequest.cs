using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableOptionalUpdateTagsRequest
{
    [JsonIgnore]
    public required string UserId { get; set; }

    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [JsonPropertyName("categories")]
    public IEnumerable<string>? Categories { get; set; }

    [JsonPropertyName("labels")]
    public IEnumerable<string>? Labels { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
