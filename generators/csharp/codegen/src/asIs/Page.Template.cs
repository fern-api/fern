using System.Collections;
using System.Collections.ObjectModel;

namespace <%= namespace%>;

/// <summary>
/// A single <see cref="Page{TItem}"/> of items from a request that may return
/// zero or more <see cref="Page{TItem}"/>s of items.
/// </summary>
/// <typeparam name="TItem">The type of items.</typeparam>
public class Page<TItem> : IEnumerable<TItem>
{
    /// <summary>
    /// Creates a new <see cref="Page{TItem}"/> with the specified items.
    /// </summary>
    /// <param name="items"></param>
    public Page(IReadOnlyList<TItem> items)
    {
        Items = items;
    }

    /// <summary>
    /// Gets the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    public IReadOnlyList<TItem> Items { get; }

    /// <summary>
    /// Enumerate the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    /// <returns></returns>
    public IEnumerator<TItem> GetEnumerator() => Items.GetEnumerator();

    /// <summary>
    /// Enumerate the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    /// <returns></returns>
    IEnumerator IEnumerable.GetEnumerator() => Items.GetEnumerator();

    /// <summary>
    /// An empty <see cref="Page{TItem}"/>.
    /// </summary>
    public static Page<TItem> Empty { get; } = new(new ReadOnlyCollection<TItem>(Array.Empty<TItem>()));

    /// <summary>
    /// Indicates whether this <see cref="Page{TItem}"/> is empty.
    /// </summary>
    public bool IsEmpty => Items.Count == 0;
}