using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(EnumSerializer<UpdateRequestIndexType>))]
public enum UpdateRequestIndexType
{
    [EnumMember(Value = "INDEX_TYPE_INVALID")]
    IndexTypeInvalid,

    [EnumMember(Value = "INDEX_TYPE_DEFAULT")]
    IndexTypeDefault,

    [EnumMember(Value = "INDEX_TYPE_STRICT")]
    IndexTypeStrict,
}
