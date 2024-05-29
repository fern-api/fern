using System.Runtime.Serialization;

#nullable enable

namespace SeedPagination;

public enum Order
{
    [EnumMember(Value = "asc")]
    Asc,

    [EnumMember(Value = "desc")]
    Desc
}
