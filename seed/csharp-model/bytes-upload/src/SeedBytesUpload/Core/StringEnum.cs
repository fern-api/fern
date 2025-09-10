using System.Text.Json.Serialization;

namespace SeedBytesUpload.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
