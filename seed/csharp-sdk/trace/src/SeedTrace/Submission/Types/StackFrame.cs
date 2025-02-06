using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record StackFrame
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("lineNumber")]
    public required int LineNumber { get; set; }

    [JsonPropertyName("scopes")]
    public IEnumerable<Scope> Scopes { get; set; } = new List<Scope>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
