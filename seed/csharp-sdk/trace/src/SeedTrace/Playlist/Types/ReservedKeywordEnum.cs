using System.Runtime.Serialization;

#nullable enable

namespace SeedTrace;

public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]
    Is,

    [EnumMember(Value = "as")]
    As
}
