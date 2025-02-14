using System.Collections;

namespace SeedPagination.Core;

/// <summary>
/// A single <see cref="Page{TItem}"/> of items from a request that may return
/// zero or more <see cref="Page{TItem}"/>s of items.
/// </summary>
/// <typeparam name="TItem">The type of items.</typeparam>
public class Page<TItem> : IEnumerable<TItem>
{
    public Page(IReadOnlyList<TItem> items)
    {
        Items = items;
    }

    /// <summary>
    /// Gets the items in this <see cref="Page{TItem}"/>.
    /// </summary>
    public IReadOnlyList<TItem> Items { get; }

    public IEnumerator<TItem> GetEnumerator() => Items.GetEnumerator();

    IEnumerator IEnumerable.GetEnumerator() => Items.GetEnumerator();
}
