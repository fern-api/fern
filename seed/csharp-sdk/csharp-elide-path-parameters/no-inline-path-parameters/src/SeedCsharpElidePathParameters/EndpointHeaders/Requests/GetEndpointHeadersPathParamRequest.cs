using global::System.Text.Json.Serialization;
using SeedCsharpElidePathParameters.Core;

namespace SeedCsharpElidePathParameters;

[Serializable]
public record GetEndpointHeadersPathParamRequest
{
    [JsonIgnore]
    public required string XApiVersion { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
