using global::System.Text.RegularExpressions;

namespace <%= namespace%>;

/// <summary>
/// An XML comment (<c>&lt;!--text--&gt;</c>) held in an element's ordered <c>Content</c> next to text
/// segments and child elements, so comments keep their position in mixed content.
/// <see cref="Placement"/> says whether the comment is rendered inside the element at its position,
/// or as a sibling immediately before or after the element whose content holds it.
/// </summary>
public sealed class XmlComment : IEquatable<XmlComment>
{
    public enum CommentPlacement
    {
        Inside,
        Before,
        After,
    }

    public XmlComment(string text, CommentPlacement placement = CommentPlacement.Inside)
    {
        Text = text ?? throw new ArgumentNullException(nameof(text));
        Placement = placement;
    }

    /// <summary>
    /// The comment text, written verbatim between <c>&lt;!--</c> and <c>--&gt;</c>.
    /// </summary>
    public string Text { get; }

    public CommentPlacement Placement { get; }

    /// <summary>
    /// A comment rendered immediately before the element whose content holds it.
    /// </summary>
    public static XmlComment Before(string text) => new(text, CommentPlacement.Before);

    /// <summary>
    /// A comment rendered immediately after the element whose content holds it.
    /// </summary>
    public static XmlComment After(string text) => new(text, CommentPlacement.After);

    public override string ToString() => "<!--" + Text + "-->";

    public bool Equals(XmlComment? other) =>
        other != null && Text == other.Text && Placement == other.Placement;

    public override bool Equals(object? obj) => Equals(obj as XmlComment);

    /// <summary>
    /// The text as it is written inside the comment. XML forbids <c>--</c> within a comment and a trailing
    /// <c>-</c>, and either would otherwise end the comment early and turn the rest into markup, so both are
    /// spaced out.
    /// </summary>
    public string XmlText()
    {
        var safe = Regex.Replace(Text, "-(?=-)", "- ");
        return safe.EndsWith("-") ? safe + " " : safe;
    }

    public override int GetHashCode() => unchecked((Text.GetHashCode() * 397) ^ (int)Placement);
}
