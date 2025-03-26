using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record TestCaseV2
{
    [JsonPropertyName("metadata")]
    public required TestCaseMetadata Metadata { get; set; }

    [JsonPropertyName("implementation")]
    public required object Implementation { get; set; }

    [JsonPropertyName("arguments")]
    public object Arguments { get; set; } = new Dictionary<string, object?>();

    [JsonPropertyName("expects")]
    public TestCaseExpects? Expects { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
