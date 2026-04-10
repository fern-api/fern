using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NestedObjectWithLiterals : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("literal1")]
    public required NestedObjectWithLiteralsLiteral1 Literal1 { get; set; }

    [JsonPropertyName("literal2")]
    public required NestedObjectWithLiteralsLiteral2 Literal2 { get; set; }

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
