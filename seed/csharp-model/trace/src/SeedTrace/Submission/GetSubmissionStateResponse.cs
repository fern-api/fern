using System.Text.Json.Serialization;
using SeedTrace;
using OneOf;

namespace SeedTrace;

public class GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; init; }

    [JsonPropertyName("submission")]
    public string Submission { get; init; }

    [JsonPropertyName("language")]
    public Language Language { get; init; }

    [JsonPropertyName("submissionTypeState")]
    public OneOf<SubmissionTypeState._Test, SubmissionTypeState._Workspace> SubmissionTypeState { get; init; }
}
