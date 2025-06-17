using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[Serializable]
public record StackFrame
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("scopes")]
    public IEnumerable<Scope> Scopes { get; set; } = new List<Scope>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
