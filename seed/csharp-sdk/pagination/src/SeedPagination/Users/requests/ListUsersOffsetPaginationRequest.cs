using SeedPagination;

namespace SeedPagination;

public class ListUsersOffsetPaginationRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    public List<int?> Page { get; init; }

    /// <summary>
    /// Defaults to per page
    /// </summary>
    public List<int?> PerPage { get; init; }

    public List<Order?> Order { get; init; }

    /// <summary>
    /// The cursor used for pagination in order to fetch
    /// the next page of results.
    /// </summary>
    public List<string?> StartingAfter { get; init; }
}
