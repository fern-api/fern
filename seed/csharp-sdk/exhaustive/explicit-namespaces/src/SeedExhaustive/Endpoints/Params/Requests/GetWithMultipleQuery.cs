using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints.Params;

public record GetWithMultipleQuery
{
    public IEnumerable<string> Query { get; set; } = new List<string>();

    public IEnumerable<int> Number { get; set; } = new List<int>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
