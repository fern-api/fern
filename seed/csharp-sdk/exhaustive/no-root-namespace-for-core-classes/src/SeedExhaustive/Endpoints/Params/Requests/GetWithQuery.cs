using SeedExhaustive.Core;

    namespace SeedExhaustive.Endpoints;

public record GetWithQuery
{
    public required string Query { get; set; }

    public required int Number { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
