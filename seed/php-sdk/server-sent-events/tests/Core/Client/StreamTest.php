<?php

namespace Seed\Tests\Core\Client;

use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use RuntimeException;
use Seed\Core\Client\JsonStream;
use Seed\Core\Client\SseEvent;
use Seed\Core\Client\SseStream;
use Seed\Core\Client\Stream;
use Seed\Core\Client\TextStream;

class StreamTest extends TestCase
{
    public function testSseParsesSingleEvent(): void
    {
        $body = "data: hello\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(['hello'], iterator_to_array($stream, false));
    }

    public function testSseConcatenatesMultilineDataWithNewlines(): void
    {
        $body = "data: line one\ndata: line two\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(["line one\nline two"], iterator_to_array($stream, false));
    }

    public function testSseStripsLeadingSpaceFromFieldValues(): void
    {
        // SSE spec: a single leading space in the field value is stripped.
        $body = "data: with-leading-space\ndata:no-leading-space\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(["with-leading-space\nno-leading-space"], iterator_to_array($stream, false));
    }

    public function testSseIgnoresCommentLines(): void
    {
        $body = ": this is a comment\ndata: payload\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(['payload'], iterator_to_array($stream, false));
    }

    public function testSseTerminatorEndsIterationCleanly(): void
    {
        $body = "data: first\n\ndata: [DONE]\n\ndata: never-yielded\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, '[DONE]');

        $this->assertSame(['first'], iterator_to_array($stream, false));
    }

    public function testSseNormalizesCrlfAndLoneCr(): void
    {
        $body = "data: a\r\n\r\ndata: b\rdata: c\r\r";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(['a', "b\nc"], iterator_to_array($stream, false));
    }

    public function testSseDispatchesTrailingEventWithoutBlankLine(): void
    {
        $body = "data: incomplete";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(['incomplete'], iterator_to_array($stream, false));
    }

    public function testSseAppliesDeserializerOncePerEvent(): void
    {
        $body = "data: {\"n\":1}\n\ndata: {\"n\":2}\n\n";
        $stream = new SseStream(self::response($body), self::jsonDecoder(), null);

        $this->assertSame([['n' => 1], ['n' => 2]], iterator_to_array($stream, false));
    }

    public function testSseEventsExposesEventIdAndRetryMetadata(): void
    {
        $body = "event: chat\nid: msg-1\nretry: 5000\ndata: hi\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $events = iterator_to_array($stream->events(), false);

        $this->assertCount(1, $events);
        $this->assertInstanceOf(SseEvent::class, $events[0]);
        $this->assertSame('hi', $events[0]->data);
        $this->assertSame('chat', $events[0]->event);
        $this->assertSame('msg-1', $events[0]->id);
        $this->assertSame(5000, $events[0]->retry);
    }

    public function testSseEventsPersistsLastEventIdAcrossEventsPerSpec(): void
    {
        // Per WHATWG SSE: once an `id:` is set it persists across subsequent
        // events until explicitly overridden.
        $body = "id: persistent\ndata: a\n\ndata: b\n\nid: replaced\ndata: c\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $events = iterator_to_array($stream->events(), false);

        $this->assertSame(['persistent', 'persistent', 'replaced'], array_map(fn (SseEvent $e) => $e->id, $events));
    }

    public function testSseEventsIgnoresIdContainingNullByte(): void
    {
        $body = "id: ok\ndata: first\n\nid: bad\0id\ndata: second\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $events = iterator_to_array($stream->events(), false);

        // Second event's malformed id is rejected; previous id persists per spec.
        $this->assertSame(['ok', 'ok'], array_map(fn (SseEvent $e) => $e->id, $events));
    }

    public function testSseEventsIgnoresNonIntegerRetry(): void
    {
        $body = "retry: not-a-number\ndata: hi\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $events = iterator_to_array($stream->events(), false);

        $this->assertNull($events[0]->retry);
    }

    public function testSseConstructorRejectsNonSseContentType(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/text\/event-stream/');

        new SseStream(
            self::response('data: x\n\n', contentType: 'application/json'),
            fn (string $d): string => $d,
            null,
        );
    }

    public function testSseConstructorRejectsNonUtf8Charset(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/charset/i');

        new SseStream(
            self::response('data: x\n\n', contentType: 'text/event-stream; charset=iso-8859-1'),
            fn (string $d): string => $d,
            null,
        );
    }

    public function testSseConstructorAcceptsUtf8CharsetParameter(): void
    {
        // No exception: UTF-8 charset parameter is the spec-mandated value.
        $stream = new SseStream(
            self::response("data: hi\n\n", contentType: 'text/event-stream; charset=UTF-8'),
            fn (string $d): string => $d,
            null,
        );

        $this->assertSame(['hi'], iterator_to_array($stream, false));
    }

    public function testSseConstructorToleratesMissingContentTypeHeader(): void
    {
        // Some streaming servers omit the header; we don't reject — we just
        // can't validate. (The wire format check is best-effort.)
        $response = \Http\Discovery\Psr17FactoryDiscovery::findResponseFactory()
            ->createResponse(200)
            ->withBody(\Http\Discovery\Psr17FactoryDiscovery::findStreamFactory()->createStream("data: hi\n\n"));

        $stream = new SseStream($response, fn (string $d): string => $d, null);

        $this->assertSame(['hi'], iterator_to_array($stream, false));
    }

    public function testStreamThrowsWhenLineBufferExceedsMaxSize(): void
    {
        // A single unterminated "line" larger than the cap must abort iteration.
        $bigLine = str_repeat('A', 200) . "\n";
        $stream = new SseStream(
            self::response("data: " . $bigLine . "\n"),
            fn (string $d): string => $d,
            terminator: null,
            maxBufferSize: 64,
        );

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/buffer/i');

        iterator_to_array($stream, false);
    }

    public function testStreamThrowsBeforeAccumulatingPastMaxBufferOnLongRunningSseEvent(): void
    {
        // The cap must fire during accumulation, not just at dispatch. A hostile
        // stream sending many small `data:` lines without a closing blank line
        // would otherwise grow $dataBuffer past the configured limit. Each line
        // here is well under the 64-byte cap, but their cumulative `data:`
        // append should trip the check before allocation balloons.
        $manyDataLines = '';
        for ($i = 0; $i < 50; $i++) {
            $manyDataLines .= "data: chunk-$i\n";
        }
        $stream = new SseStream(
            self::response($manyDataLines),  // no terminating "\n\n"
            fn (string $d): string => $d,
            terminator: null,
            maxBufferSize: 64,
        );

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessageMatches('/buffer/i');

        iterator_to_array($stream, false);
    }

    public function testSseStripsUtf8BomFromStartOfStream(): void
    {
        // WHATWG §9.2.4: a leading U+FEFF BOM must be stripped from the stream
        // so the first field-name match isn't poisoned.
        $body = "\xEF\xBB\xBFdata: hello\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(['hello'], iterator_to_array($stream, false));
    }

    public function testSseStripsBomOnlyAtVeryStart(): void
    {
        // A BOM-looking sequence that appears mid-stream must NOT be stripped.
        $body = "data: first\n\ndata: \xEF\xBB\xBFsecond\n\n";
        $stream = new SseStream(self::response($body), fn (string $d): string => $d, null);

        $this->assertSame(['first', "\xEF\xBB\xBFsecond"], iterator_to_array($stream, false));
    }

    public function testJsonStreamYieldsOnePerLine(): void
    {
        $body = "{\"n\":1}\n{\"n\":2}\n{\"n\":3}\n";
        $stream = new JsonStream(self::response($body), self::jsonDecoder(), null);

        $this->assertSame([['n' => 1], ['n' => 2], ['n' => 3]], iterator_to_array($stream, false));
    }

    public function testJsonStreamSkipsEmptyLines(): void
    {
        $body = "{\"a\":1}\n\n{\"a\":2}\n";
        $stream = new JsonStream(self::response($body), self::jsonDecoder(), null);

        $this->assertSame([['a' => 1], ['a' => 2]], iterator_to_array($stream, false));
    }

    public function testJsonStreamTerminatorEndsIteration(): void
    {
        $body = "{\"a\":1}\n[DONE]\n{\"a\":2}\n";
        $stream = new JsonStream(self::response($body), self::jsonDecoder(), '[DONE]');

        $this->assertSame([['a' => 1]], iterator_to_array($stream, false));
    }

    /**
     * @return \Closure(string): array<string, mixed>
     */
    private static function jsonDecoder(): \Closure
    {
        return static function (string $raw): array {
            /** @var array<string, mixed> $decoded */
            $decoded = json_decode($raw, true);
            return $decoded;
        };
    }

    public function testTextStreamYieldsRawLines(): void
    {
        $body = "alpha\nbeta\ngamma\n";
        $stream = new TextStream(self::response($body));

        $this->assertSame(['alpha', 'beta', 'gamma'], iterator_to_array($stream, false));
    }

    public function testTextStreamPreservesEmptyLines(): void
    {
        $body = "alpha\n\nbeta\n";
        $stream = new TextStream(self::response($body));

        $this->assertSame(['alpha', '', 'beta'], iterator_to_array($stream, false));
    }

    /**
     * Build a PSR-7 ResponseInterface with the given body. The Content-Type
     * defaults to `text/event-stream` so SSE tests just work; pass an override
     * for the validation-error cases.
     */
    private static function response(
        string $body,
        string $contentType = 'text/event-stream',
    ): ResponseInterface {
        return \Http\Discovery\Psr17FactoryDiscovery::findResponseFactory()
            ->createResponse(200)
            ->withHeader('Content-Type', $contentType)
            ->withBody(
                \Http\Discovery\Psr17FactoryDiscovery::findStreamFactory()
                    ->createStream($body),
            );
    }
}
