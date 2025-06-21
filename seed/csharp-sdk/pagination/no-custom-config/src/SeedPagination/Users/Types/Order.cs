using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedPagination.Core;

namespace SeedPagination;

[JsonConverter(typeof(EnumSerializer<Order>))]
public enum Order
{
    [EnumMember(Value = "asc")]
    Asc,

    [EnumMember(Value = "desc")]
    Desc,
}
