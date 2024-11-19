using NUnit.Framework;
using SeedPagination.Core;

namespace SeedPagination.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class NoRequestOffsetTestCase
{
    [Test]
    public async Task OffsetPagerShouldWorkWithoutRequest()
    {
        var pager = CreatePager();
        await AssertPager(pager);
    }

    public Pager<object> CreatePager()
    {
        var responses = new List<Response>
        {
            new() { Data = new() { Items = ["item1", "item2"] } },
            new() { Data = new() { Items = ["item1"] } },
            new() { Data = new() { Items = [] } },
        }.GetEnumerator();
        Pager<object> pager = new OffsetPager<Request?, object?, Response, int, object?, object>(
            null,
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return Task.FromResult(responses.Current);
            },
            request => request?.Pagination?.Page ?? 0,
            (request, offset) =>
            {
                request.Pagination ??= new();
                request.Pagination.Page = offset;
            },
            null,
            response => response?.Data?.Items?.ToList(),
            null
        );
        return pager;
    }

    public async Task AssertPager(Pager<object> pager)
    {
        var pageCounter = 0;
        var itemCounter = 0;
        await foreach (var page in pager.AsPagesAsync())
        {
            pageCounter++;
            itemCounter += page.Items.Count;
        }

        Assert.Multiple(() =>
        {
            Assert.That(pageCounter, Is.EqualTo(3));
            Assert.That(itemCounter, Is.EqualTo(3));
        });
    }

    private class Request
    {
        public Pagination Pagination { get; set; }
    }

    private class Pagination
    {
        public int Page { get; set; }
    }

    private class Response
    {
        public Data Data { get; set; }
    }

    private class Data
    {
        public IEnumerable<string> Items { get; set; }
    }
}
