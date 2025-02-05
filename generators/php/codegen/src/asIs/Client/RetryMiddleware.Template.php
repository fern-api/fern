<?php

namespace <%= namespace%>;

use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Promise as P;
use GuzzleHttp\Promise\PromiseInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class RetryMiddleware
{
    /**
     * @var callable(RequestInterface, array): PromiseInterface
     */
    private $nextHandler;

    /**
     * @var array{
     *  maxRetries: int,
     *  retryStatusCodes: array<int>,
     *  retryOnTimeout: bool,
     * }
     */
    private array $options;

    /**
     * @param callable $nextHandler
     * @param array{
     *      maxRetries?: int,
     *      retryStatusCodes?: array<int>,
     *      retryOnTimeout?: bool,
     *  }|null $options
     */
    public function __construct(
        callable $nextHandler,
        ?array   $options = null,
    )
    {
        $this->nextHandler = $nextHandler;
        $this->options = array_merge([
            'maxRetries' => 3,
            'retryStatusCodes' => [429, 500, 502, 503, 504],
            'retryOnTimeout' => true,
        ], $options ?? []);
    }

    /**
     * @param array{
     * maxRetries?: int,
     * retryStatusCodes?: array<int>,
     * retryOnTimeout?: bool,
     * }|null $options
     * @return callable
     */
    public static function create(?array $options): callable
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
     *      retryStatusCodes?: array<int>,
     *      retryOnTimeout?: bool,
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
     * @param bool $retryOnTimeout
     * @param int[] $retryStatusCodes
     * @param ResponseInterface|null $response
     * @param $exception
     * @return bool
     */
    private function shouldRetry(
        int                $retries,
        int                $maxRetries,
        bool               $retryOnTimeout,
        array              $retryStatusCodes,
        ?ResponseInterface $response = null,
                           $exception = null
    )
    {
        if ($retries >= $maxRetries) {
            return false;
        }

        // Check for timeout
        if ($retryOnTimeout && $exception instanceof ConnectException) {
            return true;
        }

        // Check status codes
        return $response && in_array($response->getStatusCode(), $retryStatusCodes);
    }

    /**
     * Execute fulfilled closure
     * @param array{
     *       retries: int,
     *       delay: int,
     *       maxRetries: int,
     *       retryStatusCodes: array<int>,
     *       retryOnTimeout: bool,
     *   } $options
     */
    private function onFulfilled(RequestInterface $request, array $options): callable
    {
        $retries = $options['retries'];
        $maxRetries = $options['maxRetries'];
        $retryStatusCodes = $options['retryStatusCodes'];
        $retryOnTimeout = $options['retryOnTimeout'];
        return function ($value) use ($request, $options, $retries, $maxRetries, $retryStatusCodes, $retryOnTimeout) {
            if (!$this->shouldRetry(
                $retries,
                $maxRetries,
                $retryOnTimeout,
                $retryStatusCodes,
                $value,
                null
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
     *   retries: int,
     *   delay: int,
     *   maxRetries: int,
     *   retryStatusCodes: array<int>,
     *   retryOnTimeout: bool,
     * } $options
     * @return callable
     */
    private function onRejected(RequestInterface $req, array $options): callable
    {
        $retries = $options['retries'];
        $maxRetries = $options['maxRetries'];
        $retryStatusCodes = $options['retryStatusCodes'];
        $retryOnTimeout = $options['retryOnTimeout'];
        return function ($reason) use ($req, $options, $retries, $maxRetries, $retryStatusCodes, $retryOnTimeout) {
            if (!$this->shouldRetry(
                $retries,
                $maxRetries,
                $retryOnTimeout,
                $retryStatusCodes,
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
     *   delay: int,
     *   retries: int,
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
    private static function exponentialDelay(int $retries): int
    {
        return 2 ** ($retries - 1) * 1000;
    }
}
