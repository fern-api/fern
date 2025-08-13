using NUnit.Framework;
using SeedPagination.Core;
using SystemTask = System.Threading.Tasks.Task;

namespace SeedPagination.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class StringCursorTest
{
    private const string? Cursor1 = null;
    private const string Cursor2 = "cursor2";
    private const string Cursor3 = "cursor3";
    private const string Cursor4 = "";

    [Test]
    public async SystemTask CursorPagerShouldWorkWithStringCursor()
    {
        var responses = new List<Response>
        {
            new()
            {
                Data = new Data { Items = ["item1", "item2"] },
                Cursor = new Cursor { Next = Cursor2 },
            },
            new()
            {
                Data = new Data { Items = ["item1"] },
                Cursor = new Cursor { Next = Cursor3 },
            },
            new()
            {
                Data = new Data { Items = [] },
                Cursor = new Cursor { Next = null },
            },
        }.GetEnumerator();
        var cursorCopy = Cursor1;
        Pager<object> pager = await CursorPager<
            Request,
            object?,
            Response,
            string,
            object
        >.CreateInstanceAsync(
            new Request { Cursor = Cursor1 },
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return SystemTask.FromResult(responses.Current);
            },
            (request, cursor) =>
            {
                request.Cursor = cursor;
                cursorCopy = cursor;
            },
            response => response?.Cursor?.Next,
            response => response?.Data?.Items?.ToList()
        );

        var pageEnumerator = pager.AsPagesAsync().GetAsyncEnumerator();

        // first page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        var page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(2));
        Assert.That(cursorCopy, Is.EqualTo(Cursor2));

        // second page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(1));
        Assert.That(cursorCopy, Is.EqualTo(Cursor3));

        // third page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(0));
        Assert.That(cursorCopy, Is.Null);

        // no more
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.False);
    }

    [Test]
    public async SystemTask CursorPagerShouldWorkWithStringCursor_EmptyStringCursor()
    {
        var responses = new List<Response>
        {
            new()
            {
                Data = new Data { Items = ["item1", "item2"] },
                Cursor = new Cursor { Next = Cursor2 },
            },
            new()
            {
                Data = new Data { Items = ["item1"] },
                Cursor = new Cursor { Next = Cursor4 },
            },
            new()
            {
                Data = new Data { Items = ["item2"] },
                Cursor = new Cursor { Next = Cursor3 },
            },
        }.GetEnumerator();
        var cursorCopy = Cursor1;
        Pager<object> pager = await CursorPager<
            Request,
            object?,
            Response,
            string,
            object
        >.CreateInstanceAsync(
            new Request { Cursor = Cursor1 },
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return SystemTask.FromResult(responses.Current);
            },
            (request, cursor) =>
            {
                request.Cursor = cursor;
                cursorCopy = cursor;
            },
            response => response?.Cursor?.Next,
            response => response?.Data?.Items?.ToList()
        );

        var pageEnumerator = pager.AsPagesAsync().GetAsyncEnumerator();

        // first page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        var page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(2));
        Assert.That(cursorCopy, Is.EqualTo(Cursor2));

        // second page (cursor is empty string)
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(1));
        Assert.That(cursorCopy, Is.EqualTo(Cursor4));

        // no more (should not reach third response)
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
