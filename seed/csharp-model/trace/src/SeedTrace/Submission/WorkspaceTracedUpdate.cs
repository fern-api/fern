using System.Text.Json.Serialization;

#nullable enable

namespace SeedTrace;

public record WorkspaceTracedUpdate
{
    [JsonPropertyName("traceResponsesSize")]
    public required int TraceResponsesSize { get; set; }
}
