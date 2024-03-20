using System.Text.Json.Serialization
using SeedTraceClient.V2.V3
using OneOf
using SeedTraceClient

namespace SeedTraceClient.V2.V3

public class DefaultProvidedFile
{
    [JsonPropertyName("file")]
    public FileInfoV2 File { get; init; }

    [JsonPropertyName("relatedTypes")]
    public List<OneOf<IntegerType, DoubleType, BooleanType, StringType, CharType, ListType, MapType, BinaryTreeType, SinglyLinkedListType, DoublyLinkedListType>> RelatedTypes { get; init; }
}
