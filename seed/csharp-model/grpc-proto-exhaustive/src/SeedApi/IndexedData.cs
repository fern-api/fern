using System.Text.Json.Serialization;
using Proto = Data.V1.Grpc;

#nullable enable

namespace SeedApi;

public record IndexedData
{
    [JsonPropertyName("indices")]
    public IEnumerable<uint> Indices { get; set; } = new List<uint>();

    [JsonPropertyName("values")]
    public IEnumerable<float> Values { get; set; } = new List<float>();

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
}
