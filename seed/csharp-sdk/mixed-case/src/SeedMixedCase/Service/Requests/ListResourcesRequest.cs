using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

public record ListResourcesRequest
{
    [JsonIgnore]
    public required int PageLimit { get; set; }

    [JsonIgnore]
    public required DateOnly BeforeDate { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
