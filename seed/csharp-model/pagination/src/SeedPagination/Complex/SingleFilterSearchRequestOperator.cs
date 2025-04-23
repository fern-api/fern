using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(EnumSerializer<SingleFilterSearchRequestOperator>))]
public enum SingleFilterSearchRequestOperator
{
    [EnumMember(Value = "=")]
    Equals,

    [EnumMember(Value = "!=")]
    NotEquals,

    [EnumMember(Value = "IN")]
    In,

    [EnumMember(Value = "NIN")]
    NotIn,

    [EnumMember(Value = "<")]
    LessThan,

    [EnumMember(Value = ">")]
    GreaterThan,

    [EnumMember(Value = "~")]
    Contains,

    [EnumMember(Value = "!~")]
    DoesNotContain,

    [EnumMember(Value = "^")]
    StartsWith,

    [EnumMember(Value = "$")]
    EndsWith,
}
