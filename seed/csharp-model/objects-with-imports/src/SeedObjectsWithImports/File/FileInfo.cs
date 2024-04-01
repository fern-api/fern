using System.Text.Json.Serialization;
using System;
using SeedObjectsWithImports.Utilities;

namespace SeedObjectsWithImports;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]
    Regular,

    [EnumMember(Value = "DIRECTORY")]
    Directory
}
