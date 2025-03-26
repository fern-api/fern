using System.Text.Json;
using System.Text.Json.Serialization;
using SeedTrace;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record GetBasicSolutionFileResponse
{
    [JsonPropertyName("solutionFileByLanguage")]
    public Dictionary<Language, FileInfoV2> SolutionFileByLanguage { get; set; } =
        new Dictionary<Language, FileInfoV2>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
