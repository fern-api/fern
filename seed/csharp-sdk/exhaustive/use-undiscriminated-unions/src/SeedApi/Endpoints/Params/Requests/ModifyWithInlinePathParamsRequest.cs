using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Endpoints;

[Serializable]
public record ModifyWithInlinePathParamsRequest
{
    [JsonIgnore]
    public required string Param { get; set; }

    [JsonIgnore]
    public required string Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
