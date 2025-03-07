using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TracedTestCase
{
    [JsonPropertyName("result")]
    public required TestCaseResultWithStdout Result { get; set; }

    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
