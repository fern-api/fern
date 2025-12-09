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
    private const MAX_RETRY_DELAY = 60000; // 60 seconds in milliseconds
    private const JITTER_FACTOR = 0.2; // 20% random jitter

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
    )
    {
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
    ): bool
    {
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

            return $this->doRetry($request, $options, $value);
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
     * @param ?ResponseInterface $response
     * @return PromiseInterface
     */
    private function doRetry(RequestInterface $request, array $options, ?ResponseInterface $response = null): PromiseInterface
    {
        $options['delay'] = $this->getRetryDelay(++$options['retryAttempt'], $response);
        return $this($request, $options);
    }

    /**
     * Calculate the retry delay based on response headers or exponential backoff.
     *
     * @param int $retryAttempt
     * @param ?ResponseInterface $response
     * @return int milliseconds
     */
    private function getRetryDelay(int $retryAttempt, ?ResponseInterface $response): int
    {
        if ($response !== null) {
            // Check Retry-After header
            $retryAfter = $response->getHeaderLine('Retry-After');
            if ($retryAfter !== '') {
                // Try parsing as integer (seconds)
                if (is_numeric($retryAfter)) {
                    $retryAfterSeconds = (int)$retryAfter;
                    if ($retryAfterSeconds > 0) {
                        return min($retryAfterSeconds * 1000, self::MAX_RETRY_DELAY);
                    }
                }

                // Try parsing as HTTP date
                $retryAfterDate = strtotime($retryAfter);
                if ($retryAfterDate !== false) {
                    $delay = ($retryAfterDate - time()) * 1000;
                    if ($delay > 0) {
                        return min(max($delay, 0), self::MAX_RETRY_DELAY);
                    }
                }
            }

            // Check X-RateLimit-Reset header
            $rateLimitReset = $response->getHeaderLine('X-RateLimit-Reset');
            if ($rateLimitReset !== '' && is_numeric($rateLimitReset)) {
                $resetTime = (int)$rateLimitReset;
                $delay = ($resetTime * 1000) - (int)(microtime(true) * 1000);
                if ($delay > 0) {
                    return $this->addPositiveJitter(min($delay, self::MAX_RETRY_DELAY));
                }
            }
        }

        // Fall back to exponential backoff with symmetric jitter
        return $this->addSymmetricJitter(
            min($this->exponentialDelay($retryAttempt), self::MAX_RETRY_DELAY)
        );
    }

    /**
     * Add positive jitter (0% to +20%) to the delay.
     *
     * @param int $delay
     * @return int
     */
    private function addPositiveJitter(int $delay): int
    {
        $jitterMultiplier = 1 + (mt_rand() / mt_getrandmax()) * self::JITTER_FACTOR;
        return (int)($delay * $jitterMultiplier);
    }

    /**
     * Add symmetric jitter (-10% to +10%) to the delay.
     *
     * @param int $delay
     * @return int
     */
    private function addSymmetricJitter(int $delay): int
    {
        $jitterMultiplier = 1 + ((mt_rand() / mt_getrandmax()) - 0.5) * self::JITTER_FACTOR;
        return (int)($delay * $jitterMultiplier);
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
