using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;
using ProtoDataV1Grpc = Data.V1.Grpc;

namespace SeedApi;

public record UpdateRequest
{
    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("values")]
    public IEnumerable<float>? Values { get; set; }

    [JsonPropertyName("setMetadata")]
    public Metadata? SetMetadata { get; set; }

    [JsonPropertyName("namespace")]
    public string? Namespace { get; set; }

    [JsonPropertyName("indexedData")]
    public IndexedData? IndexedData { get; set; }

    [JsonPropertyName("indexType")]
    public IndexType? IndexType { get; set; }

    [JsonPropertyName("details")]
    public object? Details { get; set; }

    [JsonPropertyName("indexTypes")]
    public IEnumerable<IndexType>? IndexTypes { get; set; }

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

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
            result.IndexType = IndexType.Value switch
            {
                SeedApi.IndexType.IndexTypeInvalid => ProtoDataV1Grpc.IndexType.Invalid,
                SeedApi.IndexType.IndexTypeDefault => ProtoDataV1Grpc.IndexType.Default,
                SeedApi.IndexType.IndexTypeStrict => ProtoDataV1Grpc.IndexType.Strict,
                _ => throw new ArgumentException($"Unknown enum value: {IndexType.Value}"),
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
                    type switch
                    {
                        SeedApi.IndexType.IndexTypeInvalid => ProtoDataV1Grpc.IndexType.Invalid,
                        SeedApi.IndexType.IndexTypeDefault => ProtoDataV1Grpc.IndexType.Default,
                        SeedApi.IndexType.IndexTypeStrict => ProtoDataV1Grpc.IndexType.Strict,
                        _ => throw new ArgumentException($"Unknown enum value: {type}"),
                    }
                )
            );
        }
        return result;
    }
}
