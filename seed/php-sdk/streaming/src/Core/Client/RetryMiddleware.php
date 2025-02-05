<?php

namespace Seed\Core\Client;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Promise as P;
use GuzzleHttp\Promise\PromiseInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;
use Throwable;

class RetryMiddleware
{
    private const RETRY_STATUS_CODES = [408, 429];

    /**
     * @var callable(RequestInterface, array): PromiseInterface
     * @phpstan-ignore missingType.iterableValue
     */
    private $nextHandler;

    /**
     * @var array{
     *     maxRetries: int,
     *     baseDelay: int,
     * }
     */
    private array $options;

    /**
     * @param callable $nextHandler
     * @param array{
     *     maxRetries?: int,
     *  }|null $options
     */
    public function __construct(
        callable $nextHandler,
        ?array   $options = null,
    ) {
        $this->nextHandler = $nextHandler;
        $this->options = array_merge([
            'maxRetries' => 2,
            'baseDelay' => 1000,
        ], $options ?? []);
    }

    /**
     * @param array{
     *     maxRetries?: int,
     *     baseDelay?: int,
     * }|null $options
     * @return callable
     */
    public static function create(?array $options = null): callable
    {
        return static function (callable $handler) use ($options): RetryMiddleware {
            return new RetryMiddleware($handler, $options);
        };
    }

    /**
     * @param RequestInterface $request
     * @param array{
     *      retries?: int,
     *      delay: int,
     *      maxRetries?: int,
     *  } $options
     * @return PromiseInterface
     */
    public function __invoke(RequestInterface $request, array $options): PromiseInterface
    {
        $options = array_merge($this->options, $options);
        if (!isset($options['retries'])) {
            $options['retries'] = 0;
        }

        $fn = $this->nextHandler;

        return $fn($request, $options)
            ->then(
                $this->onFulfilled($request, $options),
                $this->onRejected($request, $options)
            );
    }

    /**
     * @param int $retries
     * @param int $maxRetries
     * @param ResponseInterface|null $response
     * @param ?Throwable $exception
     * @return bool
     */
    private function shouldRetry(
        int                $retries,
        int                $maxRetries,
        ?ResponseInterface $response = null,
        ?Throwable         $exception = null
    ): bool {
        if ($retries >= $maxRetries) {
            return false;
        }

        // Check for timeout
        if ($exception instanceof ConnectException) {
            return true;
        }

        if ($response) {
            // Check status codes
            return $response->getStatusCode() >= 500 ||
                in_array($response->getStatusCode(), self::RETRY_STATUS_CODES);
        }
        return false;
    }

    /**
     * Execute fulfilled closure
     * @param array{
     *     retries: int,
     *     delay: int,
     *     maxRetries: int,
     * } $options
     */
    private function onFulfilled(RequestInterface $request, array $options): callable
    {
        $retries = $options['retries'];
        $maxRetries = $options['maxRetries'];
        return function ($value) use ($request, $options, $retries, $maxRetries) {
            if (!$this->shouldRetry(
                $retries,
                $maxRetries,
                $value
            )) {
                return $value;
            }

            return $this->doRetry($request, $options);
        };
    }

    /**
     * Execute rejected closure
     * @param RequestInterface $req
     * @param array{
     *     retries: int,
     *     delay: int,
     *     maxRetries: int,
     * } $options
     * @return callable
     */
    private function onRejected(RequestInterface $req, array $options): callable
    {
        $retries = $options['retries'];
        $maxRetries = $options['maxRetries'];
        return function ($reason) use ($req, $options, $retries, $maxRetries) {
            if (!$this->shouldRetry(
                $retries,
                $maxRetries,
                null,
                $reason
            )) {
                return P\Create::rejectionFor($reason);
            }

            return $this->doRetry($req, $options);
        };
    }

    /**
     * @param RequestInterface $request
     * @param array{
     *     delay: int,
     *     retries: int,
     * } $options
     * @return PromiseInterface
     */
    private function doRetry(RequestInterface $request, array $options): PromiseInterface
    {
        $options['delay'] = $this->exponentialDelay(++$options['retries']);
        return $this($request, $options);
    }

    /**
     * Default exponential backoff delay function.
     *
     * @return int milliseconds.
     */
    private function exponentialDelay(int $retries): int
    {
        return 2 ** ($retries - 1) * $this->options['baseDelay'];
    }
}
