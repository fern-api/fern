using System.Text.Json.Serialization;
using System.Text.Json;
using SeedTrace.Core;

namespace SeedTrace.V2;

public record Files
{
    [JsonPropertyName("files")]
    public IEnumerable<FileInfoV2> Files_ { get; set; } = new List<FileInfoV2>();

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
