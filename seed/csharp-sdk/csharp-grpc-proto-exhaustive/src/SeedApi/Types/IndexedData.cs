using System.Text.Json.Serialization;
using SeedApi.Core;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record IndexedData
{
    [JsonPropertyName("indices")]
    public IEnumerable<uint> Indices { get; set; } = new List<uint>();

    [JsonPropertyName("values")]
    public IEnumerable<float> Values { get; set; } = new List<float>();

    public override string ToString()
    {
        return JsonUtils.Serialize(this);
    }

    /// <summary>
    /// Maps the IndexedData type into its Protobuf-equivalent representation.
    /// </summary>
    internal Proto.IndexedData ToProto()
    {
        var result = new Proto.IndexedData();
        if (Indices.Any())
        {
            result.Indices.AddRange(Indices);
        }
        if (Values.Any())
        {
            result.Values.AddRange(Values);
        }
        return result;
    }

    /// <summary>
    /// Returns a new IndexedData type from its Protobuf-equivalent representation.
    /// </summary>
    internal static IndexedData FromProto(Proto.IndexedData value)
    {
        return new IndexedData
        {
            Indices = value.Indices?.ToList() ?? new List<uint>(),
            Values = value.Values?.ToList() ?? new List<float>(),
        };
    }
}
