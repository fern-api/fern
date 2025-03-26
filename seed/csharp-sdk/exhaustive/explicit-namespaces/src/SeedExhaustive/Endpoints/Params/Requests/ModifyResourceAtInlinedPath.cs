using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

public record ModifyResourceAtInlinedPath
{
    [JsonIgnore]
    public required string Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
