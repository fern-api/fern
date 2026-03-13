using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

[Serializable]
public record UpdateRequest
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float>? Values { get; set; }

    [JsonPropertyName("set_metadata")]
    public Metadata? SetMetadata { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("indexed_data")]
    public IndexedData? IndexedData { get; set; }

    [JsonPropertyName("index_type")]
    public IndexType? IndexType { get; set; }

    [JsonPropertyName("details")]
    public object? Details { get; set; }

    [JsonPropertyName("index_types")]
    public IEnumerable<IndexType>? IndexTypes { get; set; }

    /// <summary>
    /// Maps the UpdateRequest type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.UpdateRequest ToProto()
    {
        var result = new Proto.UpdateRequest();
        result.Id = Id;
        if (Values != null && Values.Any())
        {
            result.Values.AddRange(Values);
        }
        if (SetMetadata != null)
        {
            result.SetMetadata = SetMetadata.ToProto();
        }
        if (Namespace != null)
        {
            result.Namespace = Namespace ?? "";
        }
        if (IndexedData != null)
        {
            result.IndexedData = IndexedData.ToProto();
        }
        if (IndexType != null)
        {
            result.IndexType = IndexType.Value.Value switch
            {
                SeedApi.IndexType.Values.IndexTypeInvalid => ProtoDataV1Grpc.IndexType.Invalid,
                SeedApi.IndexType.Values.IndexTypeDefault => ProtoDataV1Grpc.IndexType.Default,
                SeedApi.IndexType.Values.IndexTypeStrict => ProtoDataV1Grpc.IndexType.Strict,
                _ => throw new ArgumentException($"Unknown enum value: {IndexType.Value.Value}"),
            };
        }
        if (Details != null)
        {
            result.Details = ProtoAnyMapper.ToProto(Details);
        }
        if (IndexTypes != null && IndexTypes.Any())
        {
            result.IndexTypes.AddRange(
                IndexTypes.Select(type =>
                    type.Value switch
                    {
                        SeedApi.IndexType.Values.IndexTypeInvalid => ProtoDataV1Grpc
                            .IndexType
                            .Invalid,
                        SeedApi.IndexType.Values.IndexTypeDefault => ProtoDataV1Grpc
                            .IndexType
                            .Default,
                        SeedApi.IndexType.Values.IndexTypeStrict => ProtoDataV1Grpc
                            .IndexType
                            .Strict,
                        _ => throw new ArgumentException($"Unknown enum value: {type}"),
                    }
                )
            );
        }
        return result;
    }

    /// <inheritdoc />
    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }
}
