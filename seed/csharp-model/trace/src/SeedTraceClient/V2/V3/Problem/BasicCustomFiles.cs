using System.Text.Json.Serialization;
using SeedTraceClient.V2.V3;
using StringEnum;
using SeedTraceClient;

namespace SeedTraceClient.V2.V3;

public class BasicCustomFiles
{
    [JsonPropertyName("methodName")]
    public string MethodName { get; init; }

    [JsonPropertyName("signature")]
    public NonVoidFunctionSignature Signature { get; init; }

    [JsonPropertyName("additionalFiles")]
    public Dictionary<StringEnum<Language>, Files> AdditionalFiles { get; init; }

    [JsonPropertyName("basicTestCaseTemplate")]
    public BasicTestCaseTemplate BasicTestCaseTemplate { get; init; }
}
