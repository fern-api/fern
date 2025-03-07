using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record TestCaseWithActualResultImplementation
{
    [JsonPropertyName("getActualResult")]
    public required NonVoidFunctionDefinition GetActualResult { get; set; }

    [JsonPropertyName("assertCorrectnessCheck")]
    public required object AssertCorrectnessCheck { get; set; }

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
