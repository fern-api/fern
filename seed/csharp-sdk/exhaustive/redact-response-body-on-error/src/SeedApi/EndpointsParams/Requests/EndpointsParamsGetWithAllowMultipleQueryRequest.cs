using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record EndpointsParamsGetWithAllowMultipleQueryRequest
{
    [JsonIgnore]
    public IEnumerable<string> Query { get; set; } = new List<string>();

    [JsonIgnore]
    public IEnumerable<int> Number { get; set; } = new List<int>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
