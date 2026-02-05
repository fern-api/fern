using System.Text.Json;
using System.Text.Json.Serialization;
using SeedPropertyAccess.Core;

namespace SeedPropertyAccess;

[Serializable]
public record Foo : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("normal")]
    public required string Normal { get; set; }

    [JsonAccess(JsonAccessType.ReadOnly)]
    [JsonPropertyName("read")]
    public string Read { get; set; }

    [JsonAccess(JsonAccessType.WriteOnly)]
    [JsonPropertyName("write")]
    public required string Write { get; set; }

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
