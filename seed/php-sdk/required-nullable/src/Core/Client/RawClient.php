<?php

namespace Seed\Core\Client;

use JsonSerializable;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\HandlerStack;
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
    )
    {
        $this->client = $this->options['client']
            ?? $this->createDefaultClient();
        $this->headers = $this->options['headers'] ?? [];
    }

    /**
     * @return Client
     */
    private function createDefaultClient(): Client
    {
        $handler = HandlerStack::create();
        $handler->push(RetryMiddleware::create());
        return new Client(['handler' => $handler]);
    }

    /**
     * @param BaseApiRequest $request
     * @param ?array{
     *     maxRetries?: int,
     *     timeout?: float,
     *     headers?: array<string, string>,
     *     queryParameters?: array<string, mixed>,
     *     bodyProperties?: array<string, mixed>,
     * } $options
     * @return ResponseInterface
     * @throws ClientExceptionInterface
     */
    public function sendRequest(
        BaseApiRequest $request,
        ?array         $options = null,
    ): ResponseInterface
    {
        $opts = $options ?? [];
        $httpRequest = $this->buildRequest($request, $opts);
        return $this->client->send($httpRequest, $this->toGuzzleOptions($opts));
    }

    /**
     * @param array{
     *     maxRetries?: int,
     *     timeout?: float,
     * } $options
     * @return array<string, mixed>
     */
    private function toGuzzleOptions(array $options): array
    {
        $guzzleOptions = [];
        if (isset($options['maxRetries'])) {
            $guzzleOptions['maxRetries'] = $options['maxRetries'];
        }
        if (isset($options['timeout'])) {
            $guzzleOptions['timeout'] = $options['timeout'];
        }
        return $guzzleOptions;
    }

    /**
     * @param BaseApiRequest $request
     * @param array{
     *     headers?: array<string, string>,
     *     queryParameters?: array<string, mixed>,
     *     bodyProperties?: array<string, mixed>,
     * } $options
     * @return Request
     */
    private function buildRequest(
        BaseApiRequest $request,
        array          $options
    ): Request
    {
        $url = $this->buildUrl($request, $options);
        $headers = $this->encodeHeaders($request, $options);
        $body = $this->encodeRequestBody($request, $options);
        return new Request(
            $request->method->name,
            $url,
            $headers,
            $body,
        );
    }

    /**
     * @param BaseApiRequest $request
     * @param array{
     *     headers?: array<string, string>,
     * } $options
     * @return array<string, string>
     */
    private function encodeHeaders(
        BaseApiRequest $request,
        array          $options,
    ): array
    {
        return match (get_class($request)) {
            JsonApiRequest::class => array_merge(
                [
                    "Content-Type" => "application/json",
                    "Accept" => "*/*",
                ],
                $this->headers,
                $request->headers,
                $options['headers'] ?? [],
            ),
            MultipartApiRequest::class => array_merge(
                $this->headers,
                $request->headers,
                $options['headers'] ?? [],
            ),
            default => throw new InvalidArgumentException('Unsupported request type: ' . get_class($request)),
        };
    }

    /**
     * @param BaseApiRequest $request
     * @param array{
     *     bodyProperties?: array<string, mixed>,
     * } $options
     * @return ?StreamInterface
     */
    private function encodeRequestBody(
        BaseApiRequest $request,
        array          $options,
    ): ?StreamInterface
    {
        return match (get_class($request)) {
            JsonApiRequest::class => $request->body === null ? null : Utils::streamFor(
                json_encode(
                    $this->buildJsonBody(
                        $request->body,
                        $options,
                    ),
                )
            ),
            MultipartApiRequest::class => $request->body != null ? new MultipartStream($request->body->toArray()) : null,
            default => throw new InvalidArgumentException('Unsupported request type: ' . get_class($request)),
        };
    }

    /**
     * @param mixed $body
     * @param array{
     *     bodyProperties?: array<string, mixed>,
     * } $options
     * @return mixed
     */
    private function buildJsonBody(
        mixed $body,
        array $options,
    ): mixed
    {
        $overrideProperties = $options['bodyProperties'] ?? [];
        if (is_array($body) && (empty($body) || self::isSequential($body))) {
            return array_merge($body, $overrideProperties);
        }

        if ($body instanceof JsonSerializable) {
            $result = $body->jsonSerialize();
        } else {
            $result = $body;
        }
        if (is_array($result)) {
            $result = array_merge($result, $overrideProperties);
            if (empty($result)) {
                // force to be serialized as {} instead of []
                return (object)($result);
            }
        }

        return $result;
    }

    /**
     * @param BaseApiRequest $request
     * @param array{
     *     queryParameters?: array<string, mixed>,
     * } $options
     * @return string
     */
    private function buildUrl(
        BaseApiRequest $request,
        array          $options,
    ): string
    {
        $baseUrl = $request->baseUrl;
        $trimmedBaseUrl = rtrim($baseUrl, '/');
        $trimmedBasePath = ltrim($request->path, '/');
        $url = "{$trimmedBaseUrl}/{$trimmedBasePath}";
        $query = array_merge(
            $request->query,
            $options['queryParameters'] ?? [],
        );
        if (!empty($query)) {
            $url .= '?' . $this->encodeQuery($query);
        }
        return $url;
    }

    /**
     * @param array<string, mixed> $query
     * @return string
     */
    private function encodeQuery(array $query): string
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

    private function encodeQueryValue(mixed $value): string
    {
        if (is_string($value)) {
            return urlencode($value);
        }
        if (is_bool($value)) {
            return $value ? 'true' : 'false';
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

    /**
     * Check if an array is sequential, not associative.
     * @param mixed[] $arr
     * @return bool
     */
    private static function isSequential(array $arr): bool
    {
        if (empty($arr)) return false;
        $length = count($arr);
        $keys = array_keys($arr);
        for ($i = 0; $i < $length; $i++) {
            if ($keys[$i] !== $i) {
                return false;
            }
        }
        return true;
    }
}
