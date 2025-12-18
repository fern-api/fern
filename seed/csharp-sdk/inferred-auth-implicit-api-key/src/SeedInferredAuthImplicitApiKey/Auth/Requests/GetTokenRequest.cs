using System.Text.Json.Serialization;
using SeedInferredAuthImplicitApiKey.Core;

namespace SeedInferredAuthImplicitApiKey;

[Serializable]
public record GetTokenRequest
{
    [JsonIgnore]
    public required string ApiKey { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
