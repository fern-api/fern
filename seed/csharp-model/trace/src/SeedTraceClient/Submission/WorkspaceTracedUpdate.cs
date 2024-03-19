using System.Text.Json.Serialization

namespace SeedTraceClient

public class WorkspaceTracedUpdate
{
    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
