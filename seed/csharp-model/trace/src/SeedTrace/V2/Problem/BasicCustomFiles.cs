using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.V2;

#nullable enable

namespace SeedTrace.V2;

public record BasicCustomFiles
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; }

    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; }

    [JsonPropertyName("additionalFiles")]
    public Dictionary<Language, Files> AdditionalFiles { get; } = new Dictionary<Language, Files>();

    [JsonPropertyName("basicTestCaseTemplate")]
    public required BasicTestCaseTemplate BasicTestCaseTemplate { get; }
}
