using System.Text.Json.Serialization;
using OneOf;
using System.Text.Json;
using SeedApi.Core;

namespace SeedApi;

public record Account
{
    [JsonPropertyName("resource_type")]
    public string ResourceType { get; set; } = "Account";

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("patient")]
    public Patient? Patient { get; set; }

    [JsonPropertyName("practitioner")]
    public Practitioner? Practitioner { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("related_resources")]
    public IEnumerable<OneOf<Account, Patient, Practitioner, Script>> RelatedResources { get; set; } = new List<OneOf<Account, Patient, Practitioner, Script>>();

    [JsonPropertyName("memo")]
    public required Memo Memo { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } = new Dictionary<string, JsonElement>();
    /// <inheritdoc />
    public override string ToString() {
        return JsonUtils.Serialize(this);
    }

}
