using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

public record User
{
    [JsonPropertyName("userName")]
    public required string UserName { get; set; }

    [JsonPropertyName("metadata_tags")]
    public IEnumerable<string> MetadataTags { get; set; } = new List<string>();

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public Dictionary<string, string> ExtraProperties { get; set; } =
        new Dictionary<string, string>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
