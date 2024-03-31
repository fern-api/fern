using System.Text.Json.Serialization;

namespace Client;

public class WorkspaceTracedUpdate
{
    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
