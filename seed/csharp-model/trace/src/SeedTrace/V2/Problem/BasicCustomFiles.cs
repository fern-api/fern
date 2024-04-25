using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

namespace SeedTrace.V2;

public class BasicCustomFiles
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }

    [JsonPropertyName("additionalFiles")]
    public List<Dictionary<Language, Files>> AdditionalFiles { get; init; }

    [JsonPropertyName("basicTestCaseTemplate")]
    public BasicTestCaseTemplate BasicTestCaseTemplate { get; init; }
}
