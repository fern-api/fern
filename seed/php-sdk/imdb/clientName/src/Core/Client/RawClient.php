<?php

namespace Seed\Core\Client;

use JsonSerializable;
use InvalidArgumentException;
use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Http\Message\MultipartStream\MultipartStreamBuilder;
use Psr\Http\Message\StreamFactoryInterface;
use Psr\Http\Message\StreamInterface;
use Seed\Core\Json\JsonApiRequest;
use Seed\Core\Json\JsonEncoder;
use Seed\Core\Multipart\MultipartApiRequest;

class RawClient
{
    /**
     * @var RetryDecoratingClient $client
     */
    private RetryDecoratingClient $client;

    /**
     * @var RequestFactoryInterface $requestFactory
     */
    private RequestFactoryInterface $requestFactory;

    /**
     * @var StreamFactoryInterface $streamFactory
     */
    private StreamFactoryInterface $streamFactory;

    /**
     * @var array<string, string> $headers
     */
    private array $headers;

    /**
     * @var ?(callable(): array<string, string>) $getAuthHeaders
     */
    private $getAuthHeaders;

    /**
     * @param ?array{
     *   baseUrl?: string,
     *   client?: ClientInterface,
     *   maxRetries?: int,
     *   timeout?: float,
     *   headers?: array<string, string>,
     *   getAuthHeaders?: callable(): array<string, string>,
     * } $options
     */
    public function __construct(
        public readonly ?array $options = null,
    ) {
        $this->client = HttpClientBuilder::build(
            $this->options['client'] ?? null,
            $this->options['maxRetries'] ?? 5,
        );
        $this->requestFactory = HttpClientBuilder::requestFactory();
        $this->streamFactory = HttpClientBuilder::streamFactory();
        $this->headers = $this->options['headers'] ?? [];
        $this->getAuthHeaders = $this->options['getAuthHeaders'] ?? null;
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
    ): ResponseInterface {
        $opts = $options ?? [];
        $httpRequest = $this->buildRequest($request, $opts);

        $timeout = $opts['timeout'] ?? $this->options['timeout'] ?? null;
        $maxRetries = $opts['maxRetries'] ?? null;

        return $this->client->send($httpRequest, $timeout, $maxRetries);
    }

    /**
     * @param BaseApiRequest $request
     * @param array{
     *     headers?: array<string, string>,
     *     queryParameters?: array<string, mixed>,
     *     bodyProperties?: array<string, mixed>,
     * } $options
     * @return RequestInterface
     */
    private function buildRequest(
        BaseApiRequest $request,
        array          $options
    ): RequestInterface {
        $url = $this->buildUrl($request, $options);
        $headers = $this->encodeHeaders($request, $options);

        $httpRequest = $this->requestFactory->createRequest(
            $request->method->name,
            $url,
        );

        // Encode body and, for multipart, capture the Content-Type with boundary.
        if ($request instanceof MultipartApiRequest && $request->body !== null) {
            $builder = new MultipartStreamBuilder($this->streamFactory);
            $request->body->addToBuilder($builder);
            $httpRequest = $httpRequest->withBody($builder->build());
            $headers['Content-Type'] = "multipart/form-data; boundary={$builder->getBoundary()}";
        } else {
            $body = $this->encodeRequestBody($request, $options);
            if ($body !== null) {
                $httpRequest = $httpRequest->withBody($body);
            }
        }

        foreach ($headers as $name => $value) {
            $httpRequest = $httpRequest->withHeader($name, $value);
        }

        return $httpRequest;
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
    ): array {
        $authHeaders = $this->getAuthHeaders !== null ? ($this->getAuthHeaders)() : [];
        return match (get_class($request)) {
            JsonApiRequest::class => array_merge(
                [
                    "Content-Type" => "application/json",
                    "Accept" => "*/*",
                ],
                $this->headers,
                $authHeaders,
                $request->headers,
                $options['headers'] ?? [],
            ),
            MultipartApiRequest::class => array_merge(
                $this->headers,
                $authHeaders,
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
    ): ?StreamInterface {
        if ($request instanceof JsonApiRequest) {
            return $request->body === null ? null : $this->streamFactory->createStream(
                JsonEncoder::encode(
                    $this->buildJsonBody(
                        $request->body,
                        $options,
                    ),
                )
            );
        }

        if ($request instanceof MultipartApiRequest) {
            return null;
        }

        throw new InvalidArgumentException('Unsupported request type: ' . get_class($request));
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
    ): mixed {
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
    ): string {
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
        return urlencode(JsonEncoder::encode($value));
    }

    /**
     * Check if an array is sequential, not associative.
     * @param mixed[] $arr
     * @return bool
     */
    private static function isSequential(array $arr): bool
    {
        if (empty($arr)) {
            return false;
        }
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
