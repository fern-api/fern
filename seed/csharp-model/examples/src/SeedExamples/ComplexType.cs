using System.Runtime.Serialization;

#nullable enable

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
