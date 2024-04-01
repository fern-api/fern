using System.Text.Json.Serialization;

namespace SeedTrace;

public class ExistingSubmissionExecuting
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
