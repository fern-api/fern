using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, object?> TestCases { get; set; } = new Dictionary<string, object?>();
}
