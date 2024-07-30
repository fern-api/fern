using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StopRequest
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }
}
