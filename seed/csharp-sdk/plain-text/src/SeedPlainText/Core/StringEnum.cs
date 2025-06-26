using System.Text.Json.Serialization;

namespace SeedPlainText.Core;

public interface IStringEnum : IEquatable<string>
{
    public string Value { get; }
}
