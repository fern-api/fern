using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class StopRequest
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
