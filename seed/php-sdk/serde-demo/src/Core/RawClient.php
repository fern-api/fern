<?php

namespace Seed\Core;

use GuzzleHttp\ClientInterface;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Utils;
use InvalidArgumentException;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;

class RawClient
{
    /**
     * @param ClientInterface $client The HTTP client used to make requests.
     * @param array<string, string> $headers The HTTP headers sent with the request.
     */
    public function __construct(
        private readonly ClientInterface $client,
        private readonly array           $headers = [],
    )
    {
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function sendRequest(
        BaseApiRequest $request,
    ): ResponseInterface
    {
        $httpRequest = $this->buildRequest($request);
        return $this->client->send($httpRequest);
    }

    private function buildRequest(
        BaseApiRequest $request
    ): Request
    {
        $url = $this->buildUrl($request);
        $headers = $this->encodeHeaders($request);
        $body = $this->encodeRequestBody($request);
        return new Request(
            $request->method->name,
            $url,
            $headers,
            $body,
        );
    }

    /**
     * @return array<string, string>
     */
    private function encodeHeaders(
        BaseApiRequest $request
    ): array
    {
        return match (get_class($request)) {
            JsonApiRequest::class => array_merge(
                ["Content-Type" => "application/json"],
                $this->headers,
                $request->headers
            ),
            default => throw new InvalidArgumentException('Unsupported request type: ' . get_class($request)),
        };
    }

    private function encodeRequestBody(
        BaseApiRequest $request
    ): ?StreamInterface
    {
        return match (get_class($request)) {
            JsonApiRequest::class => $request->body != null ? Utils::streamFor(json_encode($request->body)) : null,
            default => throw new InvalidArgumentException('Unsupported request type: ' . get_class($request)),
        };
    }

    private function buildUrl(
        BaseApiRequest $request
    ): string
    {
        $baseUrl = $request->baseUrl;
        $trimmedBaseUrl = rtrim($baseUrl, '/');
        $trimmedBasePath = ltrim($request->path, '/');
        $url = "{$trimmedBaseUrl}/{$trimmedBasePath}";

        if (!empty($request->query)) {
            $url .= '?' . $this->encodeQuery($request->query);
        }

        return $url;
    }

    /**
     * @param array<string, mixed> $query
     */
    private function encodeQuery(
        array $query
    ): string
    {
        $parts = [];
        foreach ($query as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $item) {
                    $parts[] = urlencode($key) . '=' . $this->encodeQueryValue($item);
                }
            } else {
                $parts[] = urlencode($key) . '=' . $this->encodeQueryValue($value);
            }
        }
        return implode('&', $parts);
    }

    private function encodeQueryValue(
        mixed $value
    ): string
    {
        if (is_string($value)) {
            return urlencode($value);
        }
        if (is_scalar($value)) {
            return urlencode((string)$value);
        }
        if (is_null($value)) {
            return 'null';
        }
        // Unreachable, but included for a best effort.
        return urlencode(strval(json_encode($value)));
    }
}
