using Contoso.Net.Core;
using global::System.Text.Json.Serialization;

namespace Contoso.Net.System;

[Serializable]
public record SystemGetUserRequest
{
    [JsonIgnore]
    public required string UserId { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
