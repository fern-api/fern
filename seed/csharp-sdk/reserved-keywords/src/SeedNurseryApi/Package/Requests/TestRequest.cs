using System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

[Serializable]
public record TestRequest
{
    [JsonIgnore]
    public required string For { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
