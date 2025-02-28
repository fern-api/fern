using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints;

public record GetWithQuery
{
    [JsonIgnore]
    public required string Query { get; set; }

    [JsonIgnore]
    public required int Number { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
