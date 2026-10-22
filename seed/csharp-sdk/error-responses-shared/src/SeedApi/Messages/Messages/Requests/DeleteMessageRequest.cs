using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi.Messages;

[Serializable]
public record DeleteMessageRequest
{
    [JsonIgnore]
    public required string Sid { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
