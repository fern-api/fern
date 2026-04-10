using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record QuerySendRequest
{
    [JsonIgnore]
    public required QuerySendRequestPrompt Prompt { get; set; }

    [JsonIgnore]
    public QuerySendRequestOptionalPrompt? OptionalPrompt { get; set; }

    [JsonIgnore]
    public required AliasToPrompt AliasPrompt { get; set; }

    [JsonIgnore]
    public AliasToPrompt? AliasOptionalPrompt { get; set; }

    [JsonIgnore]
    public required string Query { get; set; }

    [JsonIgnore]
    public required bool Stream { get; set; }

    [JsonIgnore]
    public bool? OptionalStream { get; set; }

    [JsonIgnore]
    public required bool AliasStream { get; set; }

    [JsonIgnore]
    public bool? AliasOptionalStream { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
