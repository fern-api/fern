using System.Text.Json.Serialization;
using SeedTrace;

namespace SeedTrace;

public class StackFrame
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }

    [JsonPropertyName("scopes")]
    public List<List<Scope>> Scopes { get; init; }
}
