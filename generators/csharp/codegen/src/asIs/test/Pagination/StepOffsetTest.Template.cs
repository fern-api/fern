using NUnit.Framework;
using SystemTask = global::System.Threading.Tasks.Task;
using <%= namespace%>.Core;

namespace <%= namespace%>.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class StepPageOffsetPaginationTest
{
    [Test]
    public async SystemTask OffsetPagerShouldWorkWithStep()
    {
        var pager = await CreatePagerAsync();
        await AssertPagerAsync(pager);
    }

    private Pagination _paginationCopy;

    private async Task<Pager<object>> CreatePagerAsync()
    {
        var responses = new List<Response>
        {
            new() { Data = new() { Items = ["item1", "item2"] } },
            new() { Data = new() { Items = ["item1"] } },
            new() { Data = new() { Items = [] } },
        }.GetEnumerator();
        _paginationCopy = new() { ItemOffset = 0, PageSize = 2 };
        Pager<object> pager = await OffsetPager<
            Request,
            object?,
            Response,
            int,
            object?,
            object
        >.CreateInstanceAsync(
            new() { Pagination = _paginationCopy },
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return SystemTask.FromResult(responses.Current);
            },
            request => request?.Pagination?.ItemOffset ?? 0,
            (request, offset) =>
            {
                request.Pagination ??= new();
                request.Pagination.ItemOffset = offset;
                _paginationCopy = request.Pagination;
            },
            request => request?.Pagination?.PageSize,
            response => response?.Data?.Items?.ToList(),
            null
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
        Assert.That(_paginationCopy.ItemOffset, Is.EqualTo(2));

        // second page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(1));
        Assert.That(_paginationCopy.ItemOffset, Is.EqualTo(3));

        // third page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(0));
        Assert.That(_paginationCopy.ItemOffset, Is.EqualTo(3));

        // no more
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.False);
    }

    private class Request
    {
        public Pagination Pagination { get; set; }
    }

    private class Pagination
    {
        public int ItemOffset { get; set; }
        public int PageSize { get; set; }
    }

    private class Response
    {
        public Data Data { get; set; }
        public bool HasNext { get; set; }
    }

    private class Data
    {
        public IEnumerable<string> Items { get; set; }
    }
}
