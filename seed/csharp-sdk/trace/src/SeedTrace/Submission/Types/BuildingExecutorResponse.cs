using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class BuildingExecutorResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("status")]
    public ExecutionSessionStatus Status { get; init; }
}
