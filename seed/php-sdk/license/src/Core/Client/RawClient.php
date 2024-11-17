<?php

namespace Seed\Core\Client;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Psr7\MultipartStream;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Utils;
use InvalidArgumentException;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Multipart\MultipartApiRequest;

class RawClient
{
    /**
     * @var ClientInterface $client
     */
    private ClientInterface $client;

    /**
     * @var array<string, string> $headers
     */
    private array $headers;

    /**
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   headers?: array<string, string>,
     * } $options
     */
    public function __construct(
        public readonly ?array $options = null,
    ) {
        $this->client = $this->options['client'] ?? new Client();
        $this->headers = $this->options['headers'] ?? [];
    }

    /**
     * @throws ClientExceptionInterface
     */
    public function sendRequest(
        BaseApiRequest $request,
    ): ResponseInterface {
        $httpRequest = $this->buildRequest($request);
        return $this->client->send($httpRequest);
    }

    private function buildRequest(
        BaseApiRequest $request
    ): Request {
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
    ): array {
        return match (get_class($request)) {
            JsonApiRequest::class => array_merge(
                ["Content-Type" => "application/json"],
                $this->headers,
                $request->headers
            ),
            MultipartApiRequest::class => array_merge(
                $this->headers,
                $request->headers
            ),
            default => throw new InvalidArgumentException('Unsupported request type: ' . get_class($request)),
        };
    }

    private function encodeRequestBody(
        BaseApiRequest $request
    ): ?StreamInterface {
        return match (get_class($request)) {
            JsonApiRequest::class => $request->body != null ? Utils::streamFor(json_encode($request->body)) : null,
            MultipartApiRequest::class => $request->body != null ? new MultipartStream($request->body->toArray()) : null,
            default => throw new InvalidArgumentException('Unsupported request type: '.get_class($request)),
        };
    }

    private function buildUrl(
        BaseApiRequest $request
    ): string {
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
    ): string {
        $parts = [];
        foreach ($query as $key => $value) {
            if (is_array($value)) {
                foreach ($value as $item) {
                    $parts[] = urlencode($key).'='.$this->encodeQueryValue($item);
                }
            } else {
                $parts[] = urlencode($key).'='.$this->encodeQueryValue($value);
            }
        }
        return implode('&', $parts);
    }

    private function encodeQueryValue(
        mixed $value
    ): string {
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
