<?php

namespace <%= namespace%>;

use Psr\Http\Message\ResponseInterface;

/**
 * A deserialized response together with the http metadata the api answered with.
 *
 * A normal client's return value is identical to a raw client's `getBody()`; the raw
 * client adds the parts of the response an endpoint method otherwise reads and discards.
 *
 * `T` is covariant: the wrapper only ever hands its body out, never takes a new one, so an
 * `HttpResponse<Domain>` is usable wherever an `HttpResponse<?Domain>` is expected.
 *
 * @template-covariant T
 */
class HttpResponse
{
    /**
     * @var T $body
     */
    private mixed $body;

    /**
     * @var array<string, string[]> $headers
     */
    private array $headers;

    /**
     * @param T $body
     * @param array<string, string[]> $headers
     */
    public function __construct(
        mixed $body,
        array $headers,
    ) {
        $this->body = $body;
        $this->headers = $headers;
    }

    /**
     * @template TBody
     * @param TBody $body
     * @param ResponseInterface $response
     * @return HttpResponse<TBody>
     */
    public static function from(mixed $body, ResponseInterface $response): HttpResponse
    {
        return new self($body, $response->getHeaders());
    }

    /**
     * The deserialized response, exactly what the non-raw client would have returned.
     *
     * @return T
     */
    public function getBody(): mixed
    {
        return $this->body;
    }

    /**
     * Every response header, keyed by the name the api sent, each with its values.
     *
     * @return array<string, string[]>
     */
    public function getHeaders(): array
    {
        return $this->headers;
    }

    /**
     * The values of one header, matched case insensitively as http requires.
     *
     * @param string $name
     * @return string[]
     */
    public function getHeader(string $name): array
    {
        foreach ($this->headers as $header => $values) {
            if (strcasecmp($header, $name) === 0) {
                return $values;
            }
        }
        return [];
    }

    /**
     * The values of one header joined with ", ", or null when the api did not send it.
     *
     * @param string $name
     * @return ?string
     */
    public function getHeaderLine(string $name): ?string
    {
        $values = $this->getHeader($name);
        return $values === [] ? null : implode(', ', $values);
    }
}
