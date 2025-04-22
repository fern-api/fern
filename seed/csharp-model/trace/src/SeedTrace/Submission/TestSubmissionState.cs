using System.Text.Json.Serialization;
using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace;

public record TestSubmissionState
{
    [JsonPropertyName("problemId")]
    public required string ProblemId { get; set; }

    [JsonPropertyName("defaultTestCases")]
    public IEnumerable<TestCase> DefaultTestCases { get; set; } = new List<TestCase>();

    [JsonPropertyName("customTestCases")]
    public IEnumerable<TestCase> CustomTestCases { get; set; } = new List<TestCase>();

    [JsonPropertyName("status")]
    public required object Status { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
