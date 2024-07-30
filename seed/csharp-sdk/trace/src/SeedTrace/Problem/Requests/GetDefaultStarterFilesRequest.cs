using System.Text.Json.Serialization;
using SeedTrace;

#nullable enable

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
    ///   - Greater Than `>`
    ///   - Less Than `<``
    ///   - Equals `=`
    ///   - Period `.`
    ///
    /// </summary>
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }
}
