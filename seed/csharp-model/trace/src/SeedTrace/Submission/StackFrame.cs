using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

namespace SeedTrace;

public record StackFrame
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; }

    [JsonPropertyName("scopes")]
    public IEnumerable<Scope> Scopes { get; } = new List<Scope>();
}
