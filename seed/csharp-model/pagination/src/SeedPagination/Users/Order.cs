using System.Runtime.Serialization;

namespace SeedPagination;

public enum Order
{
    [EnumMember(Value = "asc")]
    Asc,

    [EnumMember(Value = "desc")]
    Desc
}
