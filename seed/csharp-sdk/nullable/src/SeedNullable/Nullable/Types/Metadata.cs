using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNullable.Core;

namespace SeedNullable;

[Serializable]
public record Metadata : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("createdAt")]
    public required DateTime CreatedAt { get; set; }

    [JsonPropertyName("updatedAt")]
    public required DateTime UpdatedAt { get; set; }

    [JsonPropertyName("avatar")]
    public string? Avatar { get; set; }

    [JsonPropertyName("activated")]
    public bool? Activated { get; set; }

    [JsonPropertyName("status")]
    public required Status Status { get; set; }

    [JsonPropertyName("values")]
    public Dictionary<string, string?>? Values { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
