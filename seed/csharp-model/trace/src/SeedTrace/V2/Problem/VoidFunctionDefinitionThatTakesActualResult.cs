using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2;

/// <summary>
/// The generated signature will include an additional param, actualResult
/// </summary>
public record VoidFunctionDefinitionThatTakesActualResult
{
    [JsonPropertyName("additionalParameters")]
    public IEnumerable<Parameter> AdditionalParameters { get; set; } = new List<Parameter>();

    [JsonPropertyName("code")]
    public required FunctionImplementationForMultipleLanguages Code { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
