using NUnit.Framework;
using SystemTask = global::System.Threading.Tasks.Task;
using <%= namespace%>.Core;

namespace <%= namespace%>.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class HasNextPageOffsetTest
{
    [Test]
    public async SystemTask OffsetPagerShouldWorkWithHasNextPage()
    {
        var pager = await CreatePagerAsync();
        await AssertPagerAsync(pager);
    }

    private static async Task<Pager<object>> CreatePagerAsync()
    {
        var responses = new List<Response>
        {
            new()
            {
                Data = new() { Items = ["item1", "item2"] },
                HasNext = true,
            },
            new()
            {
                Data = new() { Items = ["item1", "item2"] },
                HasNext = true,
            },
            new()
            {
                Data = new() { Items = ["item1"] },
                HasNext = false,
            },
        }.GetEnumerator();
        Pager<object> pager = await OffsetPager<Request, object?, Response, int, object?, object>.CreateInstanceAsync(
            new() { Pagination = new() { Page = 1 } },
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return SystemTask.FromResult(responses.Current);
            },
            request => request?.Pagination?.Page ?? 0,
            (request, offset) =>
            {
                request.Pagination ??= new();
                request.Pagination.Page = offset;
            },
            null,
            response => response?.Data?.Items?.ToList(),
            response => response.HasNext
        );
        return pager;
    }

    private static async SystemTask AssertPagerAsync(Pager<object> pager)
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
            Assert.That(itemCounter, Is.EqualTo(5));
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
        public bool HasNext { get; set; }
    }

    private class Data
    {
        public IEnumerable<string> Items { get; set; }
    }
}
