using System.Text.Json.Serialization;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record VoidFunctionDefinition
{
    [JsonPropertyName("parameters")]
    public IEnumerable<Parameter> Parameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }
}
