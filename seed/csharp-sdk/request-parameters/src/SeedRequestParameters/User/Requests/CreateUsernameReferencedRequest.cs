using System.Text.Json.Serialization;
using SeedRequestParameters.Core;

namespace SeedRequestParameters;

[Serializable]
public record CreateUsernameReferencedRequest
{
    [JsonIgnore]
    public IEnumerable<string> Tags { get; set; } = new List<string>();

    [JsonIgnore]
    public required CreateUsernameBody Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
