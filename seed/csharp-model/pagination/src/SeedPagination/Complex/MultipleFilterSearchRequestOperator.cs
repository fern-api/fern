using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

[JsonConverter(typeof(EnumSerializer<MultipleFilterSearchRequestOperator>))]
public enum MultipleFilterSearchRequestOperator
{
    [EnumMember(Value = "AND")]
    And,

    [EnumMember(Value = "OR")]
    Or,
}
