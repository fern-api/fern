using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record RefundBody
{
    [JsonIgnore]
    public required string Id { get; set; }

    [JsonIgnore]
    public RefundRequest? Body { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
