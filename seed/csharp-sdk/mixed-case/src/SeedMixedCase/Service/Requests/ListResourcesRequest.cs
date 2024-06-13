namespace SeedMixedCase;

public class ListResourcesRequest
{
    public int PageLimit { get; init; }

    public DateOnly BeforeDate { get; init; }
}
