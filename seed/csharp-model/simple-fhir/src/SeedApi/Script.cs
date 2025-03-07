using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

public record Script
{
    [JsonPropertyName("resource_type")]
    public string ResourceType { get; set; } = "Script";

    [JsonPropertyName("name")]
    public required string Name { get; set; }

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("related_resources")]
    public IEnumerable<
        OneOf<Account, Patient, Practitioner, Script>
    > RelatedResources { get; set; } = new List<OneOf<Account, Patient, Practitioner, Script>>();

    [JsonPropertyName("memo")]
    public required Memo Memo { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties =
        new Dictionary<string, JsonElement>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
