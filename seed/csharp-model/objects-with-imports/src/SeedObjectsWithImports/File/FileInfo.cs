using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports;

[JsonConverter(typeof(EnumSerializer<FileInfo>))]
public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]
    Regular,

    [EnumMember(Value = "DIRECTORY")]
    Directory,
}
