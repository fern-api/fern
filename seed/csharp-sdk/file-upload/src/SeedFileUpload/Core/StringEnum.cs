using System.Text.Json.Serialization;

namespace SeedFileUpload.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
