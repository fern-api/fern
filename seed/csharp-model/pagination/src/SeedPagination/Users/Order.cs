using System.Text.Json.Serialization;
using SeedPagination.Core;
using System.Runtime.Serialization;

namespace SeedPagination;

[JsonConverter(typeof(EnumSerializer<Order>))]
public enum Order
{
    [EnumMember(Value = "asc")]Asc,

    [EnumMember(Value = "desc")]Desc
}
