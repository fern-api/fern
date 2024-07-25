using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, object> TestCases { get; init; } = new Dictionary<string, object>();
}
