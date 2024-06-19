using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class FinishedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
