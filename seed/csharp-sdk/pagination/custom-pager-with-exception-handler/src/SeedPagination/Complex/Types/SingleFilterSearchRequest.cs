using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record SingleFilterSearchRequest
{
    [JsonPropertyName("field")]
    public string? Field { get; set; }

    [JsonPropertyName("operator")]
    public SingleFilterSearchRequestOperator? Operator { get; set; }

    [JsonPropertyName("value")]
    public string? Value { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
