using System.Text.Json.Serialization;
using StringEnum;
using Client;

namespace Client;

public class BuildingExecutorResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("status")]
    public StringEnum<ExecutionSessionStatus> Status { get; init; }
}
