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

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
