using System.Text.Json.Serialization;
using StringEnum;
using SeedTrace;

namespace SeedTrace;

public class RunningResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("state")]
    public StringEnum<RunningSubmissionState> State { get; init; }
}
