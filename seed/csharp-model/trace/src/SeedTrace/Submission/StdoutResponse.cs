using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record StdoutResponse
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; set; }

    [JsonPropertyName("stdout")]
    public required string Stdout { get; set; }
}
