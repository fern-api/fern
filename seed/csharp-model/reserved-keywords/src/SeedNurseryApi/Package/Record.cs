using System.Text.Json;
using System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

public record Record
{
    [JsonPropertyName("foo")]
    public Dictionary<string, string> Foo { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("3d")]
    public required int _3D { get; set; }

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
