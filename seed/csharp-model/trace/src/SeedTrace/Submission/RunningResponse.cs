using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class RunningResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("state")]
    public RunningSubmissionState State { get; init; }
}
