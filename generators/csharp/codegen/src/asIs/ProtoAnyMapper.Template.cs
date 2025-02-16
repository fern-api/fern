using System.Reflection;
using Google.Protobuf;
using Google.Protobuf.WellKnownTypes;
using WellKnownProto = Google.Protobuf.WellKnownTypes;

namespace <%= namespace%>;

public static class ProtoAnyMapper
{
    public static Any? ToProto(object? value)
    {
        if (value == null)
        {
            return null;
        }
        var toProtoMethod = value.GetType().GetMethod(
            "ToProto",
            BindingFlags.Instance | BindingFlags.NonPublic
        );
        if (toProtoMethod == null)
        {
            throw new InvalidOperationException($"Type {value.GetType()} does not have a ToProto method");
        }
        var protoValue = toProtoMethod.Invoke(value, null);
        return WellKnownProto.Any.Pack((IMessage)protoValue);
    }
}