using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class ExistingSubmissionExecuting
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
}
