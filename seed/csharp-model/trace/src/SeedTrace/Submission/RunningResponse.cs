using System.Text.Json.Serialization;
using SeedTrace.Core;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class RunningResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("state")JsonConverter(typeof(StringEnumSerializer;
    <RunningSubmissionState;
    >))]
    public RunningSubmissionState State { get; init; }
}
