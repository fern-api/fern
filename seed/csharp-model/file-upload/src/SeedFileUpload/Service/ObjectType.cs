using System.Text.Json.Serialization;
using SeedFileUpload.Core;
using System.Runtime.Serialization;

namespace SeedFileUpload;

[JsonConverter(typeof(EnumSerializer<ObjectType>))]
public enum ObjectType
{
    [EnumMember(Value = "FOO")]Foo,

    [EnumMember(Value = "BAR")]Bar
}
