using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<ReservedKeywordEnum>))]
public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]
    Is,

    [EnumMember(Value = "as")]
    As,
}
