using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedObjectsWithImports;
using SeedObjectsWithImports.Core;

#nullable enable

namespace SeedObjectsWithImports.File.Types;

[JsonConverter(typeof(StringEnumSerializer<FileInfo>))]
public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]
    Regular,

    [EnumMember(Value = "DIRECTORY")]
    Directory
}
