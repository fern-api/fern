using System.Text.Json.Serialization;

namespace SeedTrace;

public class WorkspaceTracedUpdate
{
    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
