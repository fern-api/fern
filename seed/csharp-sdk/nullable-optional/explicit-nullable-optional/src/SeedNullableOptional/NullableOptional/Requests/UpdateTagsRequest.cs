using System.Text.Json.Serialization;
using SeedNullableOptional.Core;

namespace SeedNullableOptional;

[Serializable]
public record UpdateTagsRequest
{
    [Nullable]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [Optional]
    [JsonPropertyName("categories")]
    public IEnumerable<string>? Categories { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("labels")]
    public Optional<IEnumerable<string>?> Labels { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
