using System.Text.Json.Serialization;
using SeedPagination.Core;
using System.Runtime.Serialization;

namespace SeedPagination;

[JsonConverter(typeof(EnumSerializer<MultipleFilterSearchRequestOperator>))]
public enum MultipleFilterSearchRequestOperator
{
    [EnumMember(Value = "AND")]And,

    [EnumMember(Value = "OR")]Or
}
