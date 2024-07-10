using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record StackFrame
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; init; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; init; }

    [JsonPropertyName("scopes")]
    public IEnumerable<Scope> Scopes { get; init; } = new List<Scope>();
}
