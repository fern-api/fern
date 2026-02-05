using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record TestMethodNameTestGroupRequest
{
    [JsonIgnore]
    public required string PathParam { get; set; }

    [JsonIgnore]
    public PlainObject? QueryParamObject { get; set; }

    [JsonIgnore]
    public int? QueryParamInteger { get; set; }

    [JsonIgnore]
    public PlainObject? Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
