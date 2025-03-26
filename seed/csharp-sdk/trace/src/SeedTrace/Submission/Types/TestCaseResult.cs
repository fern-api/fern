using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record TestCaseResult
{
    [JsonPropertyName("expectedResult")]
    public required object ExpectedResult { get; set; }

    [JsonPropertyName("actualResult")]
    public required object ActualResult { get; set; }

    [JsonPropertyName("passed")]
    public required bool Passed { get; set; }

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
