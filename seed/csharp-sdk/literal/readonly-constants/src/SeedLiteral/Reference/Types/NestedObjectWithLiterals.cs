using System.Text.Json;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[Serializable]
public record NestedObjectWithLiterals : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("literal1")]
    public string Literal1
    {
        get => "literal1";
        set =>
            value.Assert(value == "literal1", string.Format("'Literal1' must be {0}", "literal1"));
    }

    [JsonPropertyName("literal2")]
    public string Literal2
    {
        get => "literal2";
        set =>
            value.Assert(value == "literal2", string.Format("'Literal2' must be {0}", "literal2"));
    }

    [JsonPropertyName("strProp")]
    public required string StrProp { get; set; }

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
