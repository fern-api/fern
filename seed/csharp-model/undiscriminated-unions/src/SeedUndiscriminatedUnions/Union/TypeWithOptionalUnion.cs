using System.Text.Json.Serialization;
using OneOf;
using System.Text.Json;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

public record TypeWithOptionalUnion
{
    [JsonPropertyName("myUnion")]
    public OneOf<string, IEnumerable<string>, int, IEnumerable<int>, IEnumerable<IEnumerable<int>>, HashSet<string>>? MyUnion { get; set; }

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
