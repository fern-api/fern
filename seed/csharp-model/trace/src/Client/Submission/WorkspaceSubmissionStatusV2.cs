using System.Text.Json.Serialization;
using Client;

namespace Client;

public class WorkspaceSubmissionStatusV2
{
    [JsonPropertyName("updates")]
    public List<WorkspaceSubmissionUpdate> Updates { get; init; }
}
