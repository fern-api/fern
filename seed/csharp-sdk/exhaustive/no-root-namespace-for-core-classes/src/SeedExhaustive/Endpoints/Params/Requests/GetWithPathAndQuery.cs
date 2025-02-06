using SeedExhaustive.Core;

    namespace SeedExhaustive.Endpoints;

public record GetWithPathAndQuery
{
    public required string Query { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
