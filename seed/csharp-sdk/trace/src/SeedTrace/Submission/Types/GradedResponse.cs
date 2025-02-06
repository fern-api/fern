using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GradedResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, TestCaseResultWithStdout> TestCases { get; set; } =
        new Dictionary<string, TestCaseResultWithStdout>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
