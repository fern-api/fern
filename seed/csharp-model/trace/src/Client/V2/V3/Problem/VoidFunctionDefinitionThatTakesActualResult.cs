using System.Text.Json.Serialization;
using Client.V2.V3;

namespace Client.V2.V3;

public class VoidFunctionDefinitionThatTakesActualResult
{
    [JsonPropertyName("additionalParameters")]
    public List<Parameter> AdditionalParameters { get; init; }

    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
