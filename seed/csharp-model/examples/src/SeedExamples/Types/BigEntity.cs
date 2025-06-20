using System.Text.Json;
using System.Text.Json.Serialization;
using OneOf;
using SeedExamples.Core;

namespace SeedExamples;

[Serializable]
public record BigEntity
{
    [JsonPropertyName("castMember")]
    public OneOf<Actor, Actress, StuntDouble>? CastMember { get; set; }

    [JsonPropertyName("extendedMovie")]
    public ExtendedMovie? ExtendedMovie { get; set; }

    [JsonPropertyName("entity")]
    public Entity? Entity { get; set; }

    [JsonPropertyName("metadata")]
    public object? Metadata { get; set; }

    [JsonPropertyName("commonMetadata")]
    public Commons.Metadata? CommonMetadata { get; set; }

    [JsonPropertyName("eventInfo")]
    public object? EventInfo { get; set; }

    [JsonPropertyName("data")]
    public object? Data { get; set; }

    [JsonPropertyName("migration")]
    public Migration? Migration { get; set; }

    [JsonPropertyName("exception")]
    public object? Exception { get; set; }

    [JsonPropertyName("test")]
    public object? Test { get; set; }

    [JsonPropertyName("node")]
    public Node? Node { get; set; }

    [JsonPropertyName("directory")]
    public Directory? Directory { get; set; }

    [JsonPropertyName("moment")]
    public Moment? Moment { get; set; }

    /// <summary>
    /// Additional properties received from the response, if any.
    /// </summary>
    /// <remarks>
    /// [EXPERIMENTAL] This API is experimental and may change in future releases.
    /// </remarks>
    [JsonExtensionData]
    public IDictionary<string, JsonElement> AdditionalProperties { get; internal set; } =
        new Dictionary<string, JsonElement>();

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
