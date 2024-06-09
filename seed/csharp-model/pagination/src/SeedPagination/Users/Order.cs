using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedPagination;
using SeedPagination.Core;

#nullable enable

namespace SeedPagination;

[JsonConverter(typeof(StringEnumSerializer<Order>))]
public enum Order
{
    [EnumMember(Value = "asc")]
    Asc,

    [EnumMember(Value = "desc")]
    Desc
}
