using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Commons;
using SeedExamples.Core;

namespace SeedExamples;

[Serializable]
public record BigEntity : IJsonOnDeserialized
{
    [JsonExtensionData]
    private readonly IDictionary<string, JsonElement> _extensionData =
        new Dictionary<string, JsonElement>();

    [JsonPropertyName("castMember")]
    public OneOf<Actor, Actress, StuntDouble>? CastMember { get; set; }

    [JsonPropertyName("extendedMovie")]
    public ExtendedMovie? ExtendedMovie { get; set; }

    [JsonPropertyName("entity")]
    public Entity? Entity { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("commonMetadata")]
    public Commons.Metadata? CommonMetadata { get; set; }

    [JsonPropertyName("eventInfo")]
    public EventInfo? EventInfo { get; set; }

    [JsonPropertyName("data")]
    public Data? Data { get; set; }

    [JsonPropertyName("migration")]
    public Migration? Migration { get; set; }

    [JsonPropertyName("exception")]
    public Exception? Exception { get; set; }

    [JsonPropertyName("test")]
    public Test? Test { get; set; }

    [JsonPropertyName("node")]
    public Node? Node { get; set; }

    [JsonPropertyName("directory")]
    public Directory? Directory { get; set; }

    [JsonPropertyName("moment")]
    public Moment? Moment { get; set; }

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
