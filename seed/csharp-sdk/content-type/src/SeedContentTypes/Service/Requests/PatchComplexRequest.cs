using System.Text.Json.Serialization;
using SeedContentTypes.Core;

namespace SeedContentTypes;

[Serializable]
public record PatchComplexRequest
{
    [Optional]
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [Optional]
    [JsonPropertyName("age")]
    public int? Age { get; set; }

    [Optional]
    [JsonPropertyName("active")]
    public bool? Active { get; set; }

    [Optional]
    [JsonPropertyName("metadata")]
    public Dictionary<string, object?>? Metadata { get; set; }

    [Optional]
    [JsonPropertyName("tags")]
    public IEnumerable<string>? Tags { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("email")]
    public Optional<string?> Email { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("nickname")]
    public Optional<string?> Nickname { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("bio")]
    public Optional<string?> Bio { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("profileImageUrl")]
    public Optional<string?> ProfileImageUrl { get; set; }

    [Nullable, Optional]
    [JsonPropertyName("settings")]
    public Optional<Dictionary<string, object?>?> Settings { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
