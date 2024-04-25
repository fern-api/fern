using System.Runtime.Serialization;

namespace SeedTrace;

public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]
    Is,

    [EnumMember(Value = "as")]
    As
}
