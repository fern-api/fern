using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types.Object;

[System.Serializable]
public record ObjectWithOptionalField : System.Text.Json.Serialization.IJsonOnDeserialized
{
    [System.Text.Json.Serialization.JsonExtensionData]
    private readonly IDictionary<string, System.Text.Json.JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    /// </summary>
    [System.Text.Json.Serialization.JsonPropertyName("string")]
    public string? String { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("integer")]
    public int? Integer { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("long")]
    public long? Long { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("double")]
    public double? Double { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("bool")]
    public bool? Bool { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("datetime")]
    public DateTime? Datetime { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("date")]
    public DateOnly? Date { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("uuid")]
    public string? Uuid { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("base64")]
    public string? Base64 { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("list")]
    public IEnumerable<string>? List { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("set")]
    public HashSet<string>? Set { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("map")]
    public Dictionary<int, string>? Map { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("bigint")]
    public string? Bigint { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public SeedExhaustive.ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } =
        new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
