using global::System.Text.Json.Serialization;
using OneOf;
using SeedApi.Core;

namespace SeedApi;

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
    public Metadata? Metadata { get; set; }

    [JsonPropertyName("commonMetadata")]
    public CommonsMetadata? CommonMetadata { get; set; }

    [JsonPropertyName("eventInfo")]
    public OneOf<CommonsEventInfoZero, CommonsEventInfoType>? EventInfo { get; set; }

    [JsonPropertyName("data")]
    public CommonsData? Data { get; set; }

    [JsonPropertyName("migration")]
    public Migration? Migration { get; set; }

    [JsonPropertyName("exception")]
    public OneOf<ExceptionZero, ExceptionType>? Exception { get; set; }

    [JsonPropertyName("test")]
    public Test? Test { get; set; }

    [JsonPropertyName("node")]
    public Node? Node { get; set; }

    [JsonPropertyName("directory")]
    public Directory? Directory { get; set; }

    [JsonPropertyName("moment")]
    public Moment? Moment { get; set; }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
