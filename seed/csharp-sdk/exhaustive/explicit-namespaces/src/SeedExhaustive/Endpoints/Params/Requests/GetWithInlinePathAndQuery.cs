using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

public record GetWithInlinePathAndQuery
{
    [JsonIgnore]
    public required string Query { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
