using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; }

    [JsonPropertyName("submission")]
    public required string Submission { get; }

    [JsonPropertyName("language")]
    public required Language Language { get; }

    [JsonPropertyName("submissionTypeState")]
    public required object SubmissionTypeState { get; }
}
