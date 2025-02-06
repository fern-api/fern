using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

public record GetDefaultStarterFilesRequest
{
    [JsonPropertyName("inputParams")]
    public IEnumerable<VariableTypeAndName> InputParams { get; set; } =
        new List<VariableTypeAndName>();

    [JsonPropertyName("outputType")]
    public required object OutputType { get; set; }

    /// <summary>
    /// The name of the `method` that the student has to complete.
    /// The method name cannot include the following characters:
    ///   - Greater Than `&gt;`
    ///   - Less Than `&lt;``
    ///   - Equals `=`
    ///   - Period `.`
    /// </summary>
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
