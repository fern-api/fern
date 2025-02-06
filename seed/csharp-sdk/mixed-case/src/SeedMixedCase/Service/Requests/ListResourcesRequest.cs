using SeedMixedCase.Core;

    namespace SeedMixedCase;

public record ListResourcesRequest
{
    public required int PageLimit { get; set; }

    public required DateOnly BeforeDate { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
