using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record BuildingExecutorResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; }

    [JsonPropertyName("status")]
    public required ExecutionSessionStatus Status { get; }
}
