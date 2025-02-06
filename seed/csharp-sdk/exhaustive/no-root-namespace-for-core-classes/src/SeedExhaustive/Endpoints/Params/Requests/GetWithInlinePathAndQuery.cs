using SeedExhaustive.Core;

    namespace SeedExhaustive.Endpoints;

public record GetWithInlinePathAndQuery
{
    public required string Query { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
