using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[Serializable]
public record OutboundCallConversationsRequest
{
    /// <summary>
    /// The phone number to call in E.164 format.
    /// </summary>
    [JsonPropertyName("to_phone_number")]
    public required string ToPhoneNumber { get; set; }

    /// <summary>
    /// If true, validates the outbound call setup without placing a call.
    /// </summary>
    [JsonPropertyName("dry_run")]
    public bool? DryRun { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
