using System.Text.Json.Serialization
using OneOf
using SeedTraceClient

namespace SeedTraceClient

public class InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public OneOf<InitializeProblemRequest,InitializeWorkspaceRequest,SubmitRequestV2,WorkspaceSubmitRequest,StopRequest> Request { get; init; }
    [JsonPropertyName("cause")]
    public OneOf<SubmissionIdNotFound,CustomTestCasesUnsupported,UnexpectedLanguageError> Cause { get; init; }
}
