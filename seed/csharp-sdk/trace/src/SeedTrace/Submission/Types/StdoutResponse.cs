using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class StdoutResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("stdout")]
    public string Stdout { get; init; }
}
