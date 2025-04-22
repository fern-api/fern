using System.Text.Json.Serialization;
using SeedObjectsWithImports.Core;
using System.Runtime.Serialization;

namespace SeedObjectsWithImports;

[JsonConverter(typeof(EnumSerializer<FileInfo>))]
public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]Regular,

    [EnumMember(Value = "DIRECTORY")]Directory
}
