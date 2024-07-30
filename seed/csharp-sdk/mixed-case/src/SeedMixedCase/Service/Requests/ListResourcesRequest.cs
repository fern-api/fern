namespace SeedMixedCase;

public record ListResourcesRequest
{
    public required int PageLimit { get; set; }

    public required DateOnly BeforeDate { get; set; }
}
