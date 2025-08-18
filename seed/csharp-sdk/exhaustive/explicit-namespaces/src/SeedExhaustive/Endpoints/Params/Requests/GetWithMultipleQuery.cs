using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

[System.Serializable]
public record GetWithMultipleQuery
{
    [System.Text.Json.Serialization.JsonIgnore]
    public IEnumerable<string> Query { get; set; } = new List<string>();

    [System.Text.Json.Serialization.JsonIgnore]
    public IEnumerable<int> Number { get; set; } = new List<int>();

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
