using System.Text.Json.Serialization;

#nullable enable

namespace SeedMixedCase;

public class User
{
    [JsonPropertyName("userName")]
    public string UserName { get; init; }

    [JsonPropertyName("metadata_tags")]
    public List<string> MetadataTags { get; init; }

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public Dictionary<string, string> ExtraProperties { get; init; }
}
