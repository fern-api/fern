using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public class WorkspaceTracedUpdate
{
    [JsonPropertyName("traceResponsesSize")]
    public int TraceResponsesSize { get; init; }
}
