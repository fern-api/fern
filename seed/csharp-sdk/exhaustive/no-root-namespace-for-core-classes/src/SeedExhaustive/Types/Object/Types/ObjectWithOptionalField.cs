using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[Serializable]
public record ObjectWithOptionalField : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// This is a rather long descriptor of this single field in a more complex type. If you ask me I think this is a pretty good description for this field all things considered.
    /// </summary>
    [Optional]
    [JsonPropertyName("string")]
    public string? String { get; set; }

    [Optional]
    [JsonPropertyName("integer")]
    public int? Integer { get; set; }

    [Optional]
    [JsonPropertyName("long")]
    public long? Long { get; set; }

    [Optional]
    [JsonPropertyName("double")]
    public double? Double { get; set; }

    [Optional]
    [JsonPropertyName("bool")]
    public bool? Bool { get; set; }

    [Optional]
    [JsonPropertyName("datetime")]
    public DateTime? Datetime { get; set; }

    [Optional]
    [JsonPropertyName("date")]
    public DateOnly? Date { get; set; }

    [Optional]
    [JsonPropertyName("uuid")]
    public string? Uuid { get; set; }

    [Optional]
    [JsonPropertyName("base64")]
    public string? Base64 { get; set; }

    [Optional]
    [JsonPropertyName("list")]
    public IEnumerable<string>? List { get; set; }

    [Optional]
    [JsonPropertyName("set")]
    public HashSet<string>? Set { get; set; }

    [Optional]
    [JsonPropertyName("map")]
    public Dictionary<int, string>? Map { get; set; }

    [Optional]
    [JsonPropertyName("bigint")]
    public string? Bigint { get; set; }

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
