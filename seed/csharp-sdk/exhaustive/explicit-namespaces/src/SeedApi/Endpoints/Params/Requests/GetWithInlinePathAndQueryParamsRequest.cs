using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Endpoints.Params;

[Serializable]
public record GetWithInlinePathAndQueryParamsRequest
{
    [JsonIgnore]
    public required string Param { get; set; }

    [JsonIgnore]
    public required string Query { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
