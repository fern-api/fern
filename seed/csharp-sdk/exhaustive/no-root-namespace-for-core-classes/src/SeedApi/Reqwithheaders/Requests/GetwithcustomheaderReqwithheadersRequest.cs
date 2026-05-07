using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record GetwithcustomheaderReqwithheadersRequest
{
    [JsonIgnore]
    public required string TestEndpointHeader { get; set; }

    [JsonIgnore]
    public required string Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
