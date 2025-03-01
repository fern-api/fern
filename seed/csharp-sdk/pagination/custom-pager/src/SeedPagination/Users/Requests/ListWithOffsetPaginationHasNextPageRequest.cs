using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

public record ListWithOffsetPaginationHasNextPageRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    [JsonIgnore]
    public int? Page { get; set; }

    /// <summary>
    /// The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    /// </summary>
    [JsonIgnore]
    public int? Limit { get; set; }

    [JsonIgnore]
    public Order? Order { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
