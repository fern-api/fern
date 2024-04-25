using System.Text.Json.Serialization;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class VoidFunctionDefinitionThatTakesActualResult
{
    [JsonPropertyName("additionalParameters")]
    public List<List<Parameter>> AdditionalParameters { get; init; }

    [JsonPropertyName("code")]
    public FunctionImplementationForMultipleLanguages Code { get; init; }
}
