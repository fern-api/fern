using System.Text.Json.Serialization;
using Client;

namespace Client;

public class StackFrame
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("lineNumber")]
    public int LineNumber { get; init; }

    [JsonPropertyName("scopes")]
    public List<Scope> Scopes { get; init; }
}
