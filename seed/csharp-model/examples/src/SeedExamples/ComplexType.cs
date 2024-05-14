using System.Runtime.Serialization;

namespace SeedExamples;

public enum ComplexType
{
    [EnumMember(Value = "object")]
    Object,

    [EnumMember(Value = "union")]
    Union,

    [EnumMember(Value = "unknown")]
    Unknown
}
