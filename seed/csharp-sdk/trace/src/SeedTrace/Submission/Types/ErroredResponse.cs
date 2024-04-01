using System.Text.Json.Serialization;
using OneOf;
using SeedTrace;

namespace SeedTrace;

public class ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }

    [JsonPropertyName("errorInfo")]
    public OneOf<ErrorInfo._CompileError, ErrorInfo._RuntimeError, ErrorInfo._InternalError> ErrorInfo { get; init; }
}
