<?php

namespace Seed\Tests\Core\Client;

use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Seed\Core\Client\JsonStream;
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
     * Build a PSR-7 ResponseInterface with the given body string, using auto-discovery
     * so we don't depend on any specific implementation.
     */
    private static function response(string $body): ResponseInterface
    {
        return \Http\Discovery\Psr17FactoryDiscovery::findResponseFactory()
            ->createResponse(200)
            ->withBody(
                \Http\Discovery\Psr17FactoryDiscovery::findStreamFactory()
                    ->createStream($body),
            );
    }
}
