using System.Text.Json.Serialization;

namespace Client;

public class ExistingSubmissionExecuting
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
