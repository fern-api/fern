using System.Text.Json;
using System.Text.Json.Serialization;
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
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
