using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record UsersListWithCustomPagerRequest
{
    /// <summary>
    /// The maximum number of results to return.
    /// </summary>
    [JsonIgnore]
    public int? Limit { get; set; }

    /// <summary>
    /// The cursor used for pagination.
    /// </summary>
    [JsonIgnore]
    public string? StartingAfter { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
