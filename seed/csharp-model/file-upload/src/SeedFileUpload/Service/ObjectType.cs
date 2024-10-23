using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedFileUpload.Core;

#nullable enable

namespace SeedFileUpload;

[JsonConverter(typeof(StringEnumSerializer<ObjectType>))]
public enum ObjectType
{
    [EnumMember(Value = "FOO")]
    Foo,

    [EnumMember(Value = "BAR")]
    Bar,
}
