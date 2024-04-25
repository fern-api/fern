using System.Runtime.Serialization;

namespace SeedObjectsWithImports;

public enum FileInfo
{
    [EnumMember(Value = "REGULAR")]
    Regular,

    [EnumMember(Value = "DIRECTORY")]
    Directory
}
