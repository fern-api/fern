using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, object> TestCases { get; } = new Dictionary<string, object>();
}
