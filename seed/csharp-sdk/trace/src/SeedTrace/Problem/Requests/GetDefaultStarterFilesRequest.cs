using System.Text.Json;
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
    ///   - Greater Than `>`
    ///   - Less Than `<``
    ///   - Equals `=`
    ///   - Period `.`
    /// </summary>
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
