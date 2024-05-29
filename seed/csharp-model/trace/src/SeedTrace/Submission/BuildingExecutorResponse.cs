using System.Text.Json.Serialization;
using SeedTrace.Core;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public class BuildingExecutorResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("status")JsonConverter(typeof(StringEnumSerializer;
    <ExecutionSessionStatus;
    >))]
    public ExecutionSessionStatus Status { get; init; }
}
