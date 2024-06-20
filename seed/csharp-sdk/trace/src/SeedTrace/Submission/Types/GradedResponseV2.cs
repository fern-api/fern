using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class GradedResponseV2
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("testCases")]
    public Dictionary<string, object> TestCases { get; init; }
}
