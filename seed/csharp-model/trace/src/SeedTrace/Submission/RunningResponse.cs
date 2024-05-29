using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

#nullable enable

namespace SeedTrace;

public class RunningResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("state")]
    [JsonConverter(typeof(StringEnumSerializer<RunningSubmissionState>))]
    public RunningSubmissionState State { get; init; }
}
