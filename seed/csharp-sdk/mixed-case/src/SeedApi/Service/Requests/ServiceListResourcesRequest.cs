using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record ServiceListResourcesRequest
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
