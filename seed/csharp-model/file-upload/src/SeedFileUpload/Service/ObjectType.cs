using System.Runtime.Serialization;
using System.Text.Json.Serialization;
using SeedFileUpload.Core;

namespace SeedFileUpload;

[JsonConverter(typeof(EnumSerializer<ObjectType>))]
public enum ObjectType
{
    [EnumMember(Value = "FOO")]
    Foo,

    [EnumMember(Value = "BAR")]
    Bar,
}
