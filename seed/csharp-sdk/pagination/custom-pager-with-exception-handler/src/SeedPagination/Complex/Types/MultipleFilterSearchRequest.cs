using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedPagination.Core;

namespace SeedPagination;

public record MultipleFilterSearchRequest
{
    [JsonPropertyName("operator")]
    public MultipleFilterSearchRequestOperator? Operator { get; set; }

    [JsonPropertyName("value")]
    public OneOf<
        IEnumerable<MultipleFilterSearchRequest>,
        IEnumerable<SingleFilterSearchRequest>
    >? Value { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
