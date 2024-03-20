using System.Text.Json.Serialization;
using StringEnum;
using SeedTraceClient;
using OneOf;

namespace SeedTraceClient;

public class GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; init; }

    [JsonPropertyName("submission")]
    public string Submission { get; init; }

    [JsonPropertyName("language")]
    public StringEnum<Language> Language { get; init; }

    [JsonPropertyName("submissionTypeState")]
    public OneOf<SubmissionTypeState._Test, SubmissionTypeState._Workspace> SubmissionTypeState { get; init; }
}
