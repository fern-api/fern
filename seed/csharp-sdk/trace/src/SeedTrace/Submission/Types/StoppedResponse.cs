using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class StoppedResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
