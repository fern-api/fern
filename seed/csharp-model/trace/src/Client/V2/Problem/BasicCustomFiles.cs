using System.Text.Json.Serialization;
using Client.V2;
using StringEnum;
using Client;

namespace Client.V2;

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
