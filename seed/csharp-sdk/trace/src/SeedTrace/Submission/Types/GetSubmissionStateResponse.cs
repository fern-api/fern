using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; init; }

    [JsonPropertyName("submission")]
    public required string Submission { get; init; }

    [JsonPropertyName("language")]
    public required Language Language { get; init; }

    [JsonPropertyName("submissionTypeState")]
    public required object SubmissionTypeState { get; init; }
}
