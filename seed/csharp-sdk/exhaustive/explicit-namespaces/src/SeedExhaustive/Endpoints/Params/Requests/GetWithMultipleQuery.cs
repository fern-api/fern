using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

public record GetWithMultipleQuery
{
    [JsonIgnore]
    public IEnumerable<string> Query { get; set; } = new List<string>();

    [JsonIgnore]
    public IEnumerable<int> Number { get; set; } = new List<int>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
