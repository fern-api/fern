using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class ErroredResponse
{
    [JsonPropertyName("submissionId")]
    public Guid SubmissionId { get; init; }
    [JsonPropertyName("errorInfo")]
    public OneOf<CompileError,RuntimeError,InternalError> ErrorInfo { get; init; }
}
