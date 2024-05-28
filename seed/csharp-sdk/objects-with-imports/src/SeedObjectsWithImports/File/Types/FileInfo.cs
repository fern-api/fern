using System.Runtime.Serialization;

#nullable enable

namespace SeedObjectsWithImports;

public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]
    Regular,

    [EnumMember(Value = "DIRECTORY")]
    Directory
}
