using System.Text.Json.Serialization
using System
using SeedObjectsWithImportsClient.Utilities

namespace SeedObjectsWithImportsClient

[JsonConverter(typeof(TolerantEnumConverter))]
public enum FileInfo
{
    [EnumMember(Value ="REGULAR")]
    Regular,
    [EnumMember(Value ="DIRECTORY")]
    Directory,
}
