using System.Text.Json.Serialization;

#nullable enable

namespace SeedMixedCase;

public record User
{
    [JsonPropertyName("userName")]
    public required string UserName { get; }

    [JsonPropertyName("metadata_tags")]
    public IEnumerable<string> MetadataTags { get; } = new List<string>();

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public Dictionary<string, string> ExtraProperties { get; } = new Dictionary<string, string>();
}
