using NUnit.Framework;
using SystemTask = global::System.Threading.Tasks.Task;
using <%= namespace%>.Core;

namespace <%= namespace%>.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class StringCursorTest
{
    [Test]
    public async SystemTask CursorPagerShouldWorkWithStringCursor()
    {
        var pager = await CreatePagerAsync();
        await AssertPagerAsync(pager);
    }

    private const string? Cursor1 = null;
    private const string Cursor2 = "cursor2";
    private const string Cursor3 = "cursor3";
    private string? _cursorCopy;

    private async Task<Pager<object>> CreatePagerAsync()
    {
        var responses = new List<Response>
        {
            new()
            {
                Data = new() { Items = ["item1", "item2"] },
                Cursor = new() { Next = Cursor2 },
            },
            new()
            {
                Data = new() { Items = ["item1"] },
                Cursor = new() { Next = Cursor3 },
            },
            new()
            {
                Data = new() { Items = [] },
                Cursor = new() { Next = null },
            },
        }.GetEnumerator();
        _cursorCopy = Cursor1;
        Pager<object> pager = await CursorPager<
            Request,
            object?,
            Response,
            string,
            object
        >.CreateInstanceAsync(
            new() { Cursor = Cursor1 },
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return SystemTask.FromResult(responses.Current);
            },
            (request, cursor) =>
            {
                request.Cursor = cursor;
                _cursorCopy = cursor;
            },
            response => response?.Cursor?.Next,
            response => response?.Data?.Items?.ToList()
        );
        return pager;
    }

    private async SystemTask AssertPagerAsync(Pager<object> pager)
    {
        var pageEnumerator = pager.AsPagesAsync().GetAsyncEnumerator();

        // first page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        var page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(2));
        Assert.That(_cursorCopy, Is.EqualTo(Cursor2));

        // second page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(1));
        Assert.That(_cursorCopy, Is.EqualTo(Cursor3));

        // third page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(0));
        Assert.That(_cursorCopy, Is.Null);

        // no more
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.False);
    }

    private class Request
    {
        public required string? Cursor { get; set; }
    }

    private class Response
    {
        public required Data Data { get; set; }
        public required Cursor Cursor { get; set; }
    }

    private class Data
    {
        public required IEnumerable<string> Items { get; set; }
    }

    private class Cursor
    {
        public required string? Next { get; set; }
    }
}
