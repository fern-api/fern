using NUnit.Framework;
using SystemTask = System.Threading.Tasks.Task;
using <%= namespace%>.Core;

namespace <%= namespace%>.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class StepPageOffsetPaginationTest
{
    [Test]
    public async SystemTask OffsetPagerShouldWorkWithStep()
    {
        var pager = CreatePager();
        await AssertPager(pager);
    }

    private Pagination _paginationCopy;
    private Pager<object> CreatePager()
    {
        var responses = new List<Response>
        {
            new()
            {
                Data = new()
                {
                    Items = ["item1", "item2"]
                }
            },
            new()
            {
                Data = new()
                {
                    Items = ["item1"]
                }
            },
            new()
            {
                Data = new()
                {
                    Items = []
                }
            }
        }.GetEnumerator();
        _paginationCopy = new()
        {
            ItemOffset = 0,
            PageSize = 2
        };
        Pager<object> pager = new OffsetPager<
            Request,
            object?,
            Response,
            int,
            object?,
            object
        >(
            new()
            {
                Pagination = _paginationCopy
            },
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

    private async SystemTask AssertPager(Pager<object> pager)
    {
        var pageEnumerator = pager.AsPagesAsync().GetAsyncEnumerator();

        // first page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        var page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(2));
        Assert.That(_paginationCopy.ItemOffset, Is.EqualTo(0));

        // second page
        Assert.That(await pageEnumerator.MoveNextAsync(), Is.True);
        page = pageEnumerator.Current;
        Assert.That(page.Items, Has.Count.EqualTo(1));
        Assert.That(_paginationCopy.ItemOffset, Is.EqualTo(2));

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