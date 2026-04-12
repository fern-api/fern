using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Base schema for union stream requests. Contains the stream_response field that is inherited by all oneOf variants via allOf. This schema is also referenced directly by a non-streaming endpoint to ensure it is not excluded from the context.
/// </summary>
[Serializable]
public record UnionStreamRequestBase : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    /// <summary>
    /// Whether to stream the response.
    /// </summary>
    [JsonPropertyName("stream_response")]
    public bool? StreamResponse { get; set; }

    /// <summary>
    /// The input prompt.
    /// </summary>
    [JsonPropertyName("prompt")]
    public required string Prompt { get; set; }

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
