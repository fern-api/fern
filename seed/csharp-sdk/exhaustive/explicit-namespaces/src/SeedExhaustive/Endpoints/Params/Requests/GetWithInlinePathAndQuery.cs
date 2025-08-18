using System.Text.Json.Serialization;
using SeedExhaustive.Core;

namespace SeedExhaustive.Endpoints.Params;

[System.Serializable]
public record GetWithInlinePathAndQuery
{
    [System.Text.Json.Serialization.JsonIgnore]
    public required string Param { get; set; }

    [System.Text.Json.Serialization.JsonIgnore]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return SeedExhaustive.Core.JsonUtils.Serialize(this);
    }
}
