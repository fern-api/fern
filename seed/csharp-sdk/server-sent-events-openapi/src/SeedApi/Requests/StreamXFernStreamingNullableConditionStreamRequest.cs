using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record StreamXFernStreamingNullableConditionStreamRequest
{
    /// <summary>
    /// The prompt or query to complete.
    /// </summary>
    [JsonPropertyName("query")]
    public required string Query { get; set; }

    /// <summary>
    /// Whether to stream the response. This field is nullable (OAS 3.1 type array), which previously caused the const literal to be overwritten by the nullable type during spread in the importer.
    /// </summary>
    [JsonPropertyName("stream")]
    public bool Stream { get; set; } = true;

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
