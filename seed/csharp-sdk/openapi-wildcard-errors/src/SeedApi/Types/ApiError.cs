using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// The shared error body returned for every 4XX and 5XX status.
/// </summary>
[Serializable]
public record ApiError : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("error_type")]
    public required string ErrorType { get; set; }

    [JsonPropertyName("error_code")]
    public required string ErrorCode { get; set; }

    [JsonPropertyName("error_message")]
    public required string ErrorMessage { get; set; }

    [JsonPropertyName("request_id")]
    public string? RequestId { get; set; }

    [JsonIgnore]
    public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

    void IJsonOnDeserialized.OnDeserialized() =>
        AdditionalProperties.CopyFromExtensionData(_extensionData);

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
