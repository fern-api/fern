using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class GetSubmissionStateResponse
{
    [JsonPropertyName("timeSubmitted")]
    public DateTime? TimeSubmitted { get; init; }

    [JsonPropertyName("submission")]
    public string Submission { get; init; }

    [JsonPropertyName("language")]
    [JsonConverter(typeof(StringEnumSerializer<Language>))]
    public Language Language { get; init; }

    [JsonPropertyName("submissionTypeState")]
    public SubmissionTypeState SubmissionTypeState { get; init; }
}
