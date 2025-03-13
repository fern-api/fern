using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListUsernamesRequest
{
    /// <summary>
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    /// </summary>
    [JsonIgnore]
    public string? StartingAfter { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
