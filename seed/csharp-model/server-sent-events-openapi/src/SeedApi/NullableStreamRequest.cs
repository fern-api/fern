using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record NullableStreamRequest : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// The prompt or query to complete.
    /// </summary>
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <summary>
    /// Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    /// </summary>
    [JsonPropertyName("stream")]
    public bool? Stream { get; set; }

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
