using System.Runtime.Serialization;

namespace SeedTrace;

public enum Language
{
    [EnumMember(Value = "JAVA")]
    Java,

    [EnumMember(Value = "JAVASCRIPT")]
    Javascript,

    [EnumMember(Value = "PYTHON")]
    Python
}
