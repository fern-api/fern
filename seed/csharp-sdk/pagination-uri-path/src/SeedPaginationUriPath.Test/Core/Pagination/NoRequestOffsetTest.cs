using global::System.Net;
using NUnit.Framework;
using SeedPaginationUriPath.Core;
using SystemTask = global::System.Threading.Tasks.Task;

namespace SeedPaginationUriPath.Test.Core.Pagination;

[TestFixture(Category = "Pagination")]
public class NoRequestOffsetTest
{
    [Test]
    public async SystemTask OffsetPagerShouldWorkWithoutRequest()
    {
        var responses = new List<Response>
        {
            new() { Data = new() { Items = ["item1", "item2"] } },
            new() { Data = new() { Items = ["item1"] } },
            new() { Data = new() { Items = [] } },
        }.GetEnumerator();
        Pager<object> pager = await OffsetPager<
            Request?,
            object?,
            Response,
            int,
            object?,
            object
        >.CreateInstanceAsync(
            null,
            null,
            (_, _, _) =>
            {
                responses.MoveNext();
                return SystemTask.FromResult(Wrap(responses.Current));
            },
            request => request?.Pagination?.Page ?? 0,
            (request, offset) =>
            {
                if (request is not null)
                {
                    request.Pagination ??= new();
                    request.Pagination.Page = offset;
                }
            },
            null,
            response => response?.Data?.Items?.ToList(),
            null
        );

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
        public Pagination? Pagination { get; set; }
    }

    private class Pagination
    {
        public int Page { get; set; }
    }

    private class Response
    {
        public Data? Data { get; set; }
    }

    private class Data
    {
        public IEnumerable<string>? Items { get; set; }
    }

    private static WithRawResponse<Response> Wrap(Response response) =>
        new()
        {
            Data = response,
            RawResponse = new RawResponse
            {
                StatusCode = HttpStatusCode.OK,
                Url = new Uri("https://localhost"),
                Headers = default,
            },
        };
}
