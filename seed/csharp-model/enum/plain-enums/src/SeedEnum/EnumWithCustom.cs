using System.Text.Json.Serialization;
using SeedEnum.Core;
using System.Runtime.Serialization;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<EnumWithCustom>))]
public enum EnumWithCustom
{
    [EnumMember(Value = "safe")]Safe,

    [EnumMember(Value = "Custom")]Custom
}
