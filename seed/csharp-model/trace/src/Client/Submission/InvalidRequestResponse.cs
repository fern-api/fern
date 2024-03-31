using System.Text.Json.Serialization;
using OneOf;
using Client;

namespace Client;

public class InvalidRequestResponse
{
    [JsonPropertyName("request")]
    public OneOf<SubmissionRequest._InitializeProblemRequest, SubmissionRequest._InitializeWorkspaceRequest, SubmissionRequest._SubmitV2, SubmissionRequest._WorkspaceSubmit, SubmissionRequest._Stop> Request { get; init; }

    [JsonPropertyName("cause")]
    public OneOf<InvalidRequestCause._SubmissionIdNotFound, InvalidRequestCause._CustomTestCasesUnsupported, InvalidRequestCause._UnexpectedLanguage> Cause { get; init; }
}
