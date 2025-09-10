using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(EnumSerializer<EnumWithSpecialCharacters>))]
public enum EnumWithSpecialCharacters
{
    [EnumMember(Value = "\\$bla")]
    Bla,

    [EnumMember(Value = "\\$yo")]
    Yo,
}
