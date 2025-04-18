using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record BasicCustomFiles
{
    [JsonPropertyName("methodName")]
    public required string MethodName { get; set; }

    [JsonPropertyName("signature")]
    public required NonVoidFunctionSignature Signature { get; set; }

    [JsonPropertyName("additionalFiles")]
    public Dictionary<Language, Files> AdditionalFiles { get; set; } =
        new Dictionary<Language, Files>();

    [JsonPropertyName("basicTestCaseTemplate")]
    public required BasicTestCaseTemplate BasicTestCaseTemplate { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
