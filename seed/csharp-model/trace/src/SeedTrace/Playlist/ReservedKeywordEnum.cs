using System.Text.Json.Serialization;
using SeedTrace.Core;
using System.Runtime.Serialization;

namespace SeedTrace;

[JsonConverter(typeof(EnumSerializer<ReservedKeywordEnum>))]
public enum ReservedKeywordEnum
{
    [EnumMember(Value = "is")]Is,

    [EnumMember(Value = "as")]As
}
