using System.Text.Json.Serialization;

namespace SeedTraceClient;

public class ExistingSubmissionExecuting
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
