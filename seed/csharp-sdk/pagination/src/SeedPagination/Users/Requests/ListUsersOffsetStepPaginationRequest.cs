using SeedPagination.Core;

    namespace SeedPagination;

public record ListUsersOffsetStepPaginationRequest
{
    /// <summary>
    /// Defaults to first page
    /// </summary>
    public int? Page { get; set; }

    /// <summary>
    /// The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    /// </summary>
    public int? Limit { get; set; }

    public Order? Order { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
