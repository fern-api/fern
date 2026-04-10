using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Reqwithheaders;

[Serializable]
public record ReqWithHeadersGetWithCustomHeaderRequest
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
