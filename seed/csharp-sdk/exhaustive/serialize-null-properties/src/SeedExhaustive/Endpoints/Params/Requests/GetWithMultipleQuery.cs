using SeedExhaustive.Core;

#nullable enable

namespace SeedExhaustive.Endpoints;

public record GetWithMultipleQuery
{
    public IEnumerable<string> Query { get; set; } = new List<string>();

    public IEnumerable<int> Numer { get; set; } = new List<int>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
