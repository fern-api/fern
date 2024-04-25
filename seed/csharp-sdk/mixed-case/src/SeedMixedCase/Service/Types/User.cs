using System.Text.Json.Serialization;

namespace SeedMixedCase;

public class User
{
    [JsonPropertyName("userName")]
    public string UserName { get; init; }

    [JsonPropertyName("metadata_tags")]
    public List<List<string>> MetadataTags { get; init; }

    [JsonPropertyName("EXTRA_PROPERTIES")]
    public List<Dictionary<string, string>> ExtraProperties { get; init; }
}
