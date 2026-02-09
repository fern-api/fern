<?php

namespace <%= namespace%>;

use Psr\Http\Client\ClientExceptionInterface;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestInterface;
use Psr\Http\Message\ResponseInterface;

class RetryDecoratingClient implements ClientInterface
{
    private const RETRY_STATUS_CODES = [408, 429];
    private const MAX_RETRY_DELAY = 60000; // 60 seconds in milliseconds
    private const JITTER_FACTOR = 0.2; // 20% random jitter

    private ClientInterface $client;
    private int $maxRetries;
    private int $baseDelay;

    /** @var callable(int): void */
    private $sleepFunction;

    /**
     * @param ClientInterface $client
     * @param int $maxRetries
     * @param int $baseDelay Base delay in milliseconds
     * @param ?callable(int): void $sleepFunction Custom sleep function (receives microseconds), defaults to usleep
     */
    public function __construct(
        ClientInterface $client,
        int $maxRetries = 2,
        int $baseDelay = 1000,
        ?callable $sleepFunction = null,
    ) {
        $this->client = $client;
        $this->maxRetries = $maxRetries;
        $this->baseDelay = $baseDelay;
        $this->sleepFunction = $sleepFunction ?? 'usleep';
    }

    /**
     * @param RequestInterface $request
     * @return ResponseInterface
     * @throws ClientExceptionInterface
     */
    public function sendRequest(RequestInterface $request): ResponseInterface
    {
        $retryAttempt = 0;
        $lastResponse = null;

        while (true) {
            try {
                $lastResponse = $this->client->sendRequest($request);
                if (!$this->shouldRetry($retryAttempt, $lastResponse)) {
                    return $lastResponse;
                }
            } catch (ClientExceptionInterface $e) {
                if ($retryAttempt >= $this->maxRetries) {
                    throw $e;
                }
            }

            $retryAttempt++;
            $delay = $this->getRetryDelay($retryAttempt, $lastResponse);
            ($this->sleepFunction)($delay * 1000); // Convert milliseconds to microseconds

            // Rewind the request body so retries don't send an empty body.
            $request->getBody()->rewind();
        }
    }

    /**
     * @param int $retryAttempt
     * @param ?ResponseInterface $response
     * @return bool
     */
    private function shouldRetry(
        int $retryAttempt,
        ?ResponseInterface $response = null,
    ): bool {
        if ($retryAttempt >= $this->maxRetries) {
            return false;
        }

        if ($response !== null) {
            return $response->getStatusCode() >= 500 ||
                in_array($response->getStatusCode(), self::RETRY_STATUS_CODES);
        }

        return false;
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
        return 2 ** ($retryAttempt - 1) * $this->baseDelay;
    }
}
