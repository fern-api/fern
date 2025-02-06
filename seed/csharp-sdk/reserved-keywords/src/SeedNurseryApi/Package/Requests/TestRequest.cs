using SeedNurseryApi.Core;

    namespace SeedNurseryApi;

public record TestRequest
{
    public required string For { get; set; }
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
