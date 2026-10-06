<?php

namespace <%= namespace%>;

use Psr\Http\Message\ResponseInterface;

/**
 * A deserialized response together with the status and the headers the api answered with.
 *
 * A normal client's return value is identical to a raw client's `getBody()`. `T` is covariant:
 * the wrapper only hands its body out, so `HttpResponse<Pet>` satisfies `HttpResponse<?Pet>`.
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
     * @var int $statusCode
     */
    private int $statusCode;

    /**
     * @var array<string, string[]> $headers
     */
    private array $headers;

    /**
     * @param T $body
     * @param ResponseInterface $response
     */
    public function __construct(mixed $body, ResponseInterface $response)
    {
        $this->body = $body;
        $this->statusCode = $response->getStatusCode();
        $this->headers = $response->getHeaders();
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
     * The http status code the api answered with.
     *
     * @return int
     */
    public function getStatusCode(): int
    {
        return $this->statusCode;
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
     * The values of one header, matched case insensitively, joined with ", "; an empty string
     * when the api did not send it, as in psr-7.
     *
     * @param string $name
     * @return string
     */
    public function getHeaderLine(string $name): string
    {
        foreach ($this->headers as $header => $values) {
            if (strcasecmp($header, $name) === 0) {
                return implode(', ', $values);
            }
        }
        return '';
    }
}
