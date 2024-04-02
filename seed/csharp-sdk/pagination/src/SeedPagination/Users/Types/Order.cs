using System.Text.Json.Serialization;
using System;
using SeedPagination.Utilities;

namespace SeedPagination;

[JsonConverter(typeof(TolerantEnumConverter))]
public enum Order
{
    [EnumMember(Value = "asc")]
    Asc,

    [EnumMember(Value = "desc")]
    Desc
}
