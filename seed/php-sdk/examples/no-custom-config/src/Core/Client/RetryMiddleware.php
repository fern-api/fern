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
    private const DEFAULT_RETRY_OPTIONS = [
        'maxRetries' => 2,
        'baseDelay' => 1000
    ];
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
     * @param ?array{
     *     maxRetries?: int,
     *  } $options
     */
    public function __construct(
        callable $nextHandler,
        ?array   $options = null,
    ) {
        $this->nextHandler = $nextHandler;
        $this->options = array_merge(self::DEFAULT_RETRY_OPTIONS, $options ?? []);
    }

    /**
     * @param ?array{
     *     maxRetries?: int,
     *     baseDelay?: int,
     * } $options
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
     *      retryAttempt?: int,
     *      delay: int,
     *      maxRetries?: int,
     *  } $options
     * @return PromiseInterface
     */
    public function __invoke(RequestInterface $request, array $options): PromiseInterface
    {
        $options = array_merge($this->options, $options);
        if (!isset($options['retryAttempt'])) {
            $options['retryAttempt'] = 0;
        }

        $fn = $this->nextHandler;

        return $fn($request, $options)
            ->then(
                $this->onFulfilled($request, $options),
                $this->onRejected($request, $options)
            );
    }

    /**
     * @param int $retryAttempt
     * @param int $maxRetries
     * @param ?ResponseInterface $response
     * @param ?Throwable $exception
     * @return bool
     */
    private function shouldRetry(
        int                $retryAttempt,
        int                $maxRetries,
        ?ResponseInterface $response = null,
        ?Throwable         $exception = null
    ): bool {
        if ($retryAttempt >= $maxRetries) {
            return false;
        }

        if ($exception instanceof ConnectException) {
            return true;
        }

        if ($response) {
            return $response->getStatusCode() >= 500 ||
                in_array($response->getStatusCode(), self::RETRY_STATUS_CODES);
        }
        return false;
    }

    /**
     * Execute fulfilled closure
     * @param array{
     *     retryAttempt: int,
     *     delay: int,
     *     maxRetries: int,
     * } $options
     */
    private function onFulfilled(RequestInterface $request, array $options): callable
    {
        $retryAttempt = $options['retryAttempt'];
        $maxRetries = $options['maxRetries'];
        return function ($value) use ($request, $options, $retryAttempt, $maxRetries) {
            if (!$this->shouldRetry(
                $retryAttempt,
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
     *     retryAttempt: int,
     *     delay: int,
     *     maxRetries: int,
     * } $options
     * @return callable
     */
    private function onRejected(RequestInterface $req, array $options): callable
    {
        $retryAttempt = $options['retryAttempt'];
        $maxRetries = $options['maxRetries'];
        return function ($reason) use ($req, $options, $retryAttempt, $maxRetries) {
            if (!$this->shouldRetry(
                $retryAttempt,
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
     *     retryAttempt: int,
     * } $options
     * @return PromiseInterface
     */
    private function doRetry(RequestInterface $request, array $options): PromiseInterface
    {
        $options['delay'] = $this->exponentialDelay(++$options['retryAttempt']);
        return $this($request, $options);
    }

    /**
     * Default exponential backoff delay function.
     *
     * @return int milliseconds.
     */
    private function exponentialDelay(int $retryAttempt): int
    {
        return 2 ** ($retryAttempt - 1) * $this->options['baseDelay'];
    }
}
