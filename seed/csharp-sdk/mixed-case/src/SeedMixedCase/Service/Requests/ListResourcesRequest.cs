using System.Text.Json.Serialization;
using SeedMixedCase.Core;

namespace SeedMixedCase;

[Serializable]
public record ListResourcesRequest
{
    [JsonIgnore]
    public required int PageLimit { get; set; }

    [JsonIgnore]
    public required DateOnly BeforeDate { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
