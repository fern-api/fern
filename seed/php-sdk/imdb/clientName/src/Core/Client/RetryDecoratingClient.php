<?php

namespace Seed\Core\Client;

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
        int $maxRetries = 5,
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
        return $this->send($request);
    }

    /**
     * Sends a request with optional per-request timeout and retry overrides.
     *
     * When a Guzzle or Symfony PSR-18 client is detected, the timeout is
     * forwarded via the client's native API. For other PSR-18 clients the
     * timeout value is silently ignored.
     *
     * @param RequestInterface $request
     * @param ?float $timeout Timeout in seconds, or null to use the client default.
     * @param ?int $maxRetries Maximum retry attempts, or null to use the client default.
     * @return ResponseInterface
     * @throws ClientExceptionInterface
     */
    public function send(
        RequestInterface $request,
        ?float $timeout = null,
        ?int $maxRetries = null,
    ): ResponseInterface {
        $maxRetries = $maxRetries ?? $this->maxRetries;
        $retryAttempt = 0;
        $lastResponse = null;

        while (true) {
            try {
                $lastResponse = $this->doSend($request, $timeout);
                if (!$this->shouldRetry($retryAttempt, $maxRetries, $lastResponse)) {
                    return $lastResponse;
                }
            } catch (ClientExceptionInterface $e) {
                if ($retryAttempt >= $maxRetries) {
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
     * Dispatches the request to the underlying client, forwarding the timeout
     * option to Guzzle or Symfony when available.
     *
     * @param RequestInterface $request
     * @param ?float $timeout
     * @return ResponseInterface
     * @throws ClientExceptionInterface
     */
    private function doSend(RequestInterface $request, ?float $timeout): ResponseInterface
    {
        static $warned = false;

        if ($timeout === null) {
            return $this->client->sendRequest($request);
        }

        if (class_exists('GuzzleHttp\ClientInterface')
            && $this->client instanceof \GuzzleHttp\ClientInterface
        ) {
            return $this->client->send($request, ['timeout' => $timeout]);
        }
        if (class_exists('Symfony\Component\HttpClient\Psr18Client')
            && $this->client instanceof \Symfony\Component\HttpClient\Psr18Client
        ) {
            /** @var ClientInterface $clientWithTimeout */
            $clientWithTimeout = $this->client->withOptions(['timeout' => $timeout]);
            return $clientWithTimeout->sendRequest($request);
        }

        if ($warned) {
            return $this->client->sendRequest($request);
        }
        $warned = true;
        trigger_error(
            'Timeout option is not supported for the current PSR-18 client ('
            . get_class($this->client)
            . '). Use Guzzle or Symfony HttpClient for timeout support.',
            E_USER_WARNING,
        );
        return $this->client->sendRequest($request);
    }

    /**
     * @param int $retryAttempt
     * @param int $maxRetries
     * @param ?ResponseInterface $response
     * @return bool
     */
    private function shouldRetry(
        int $retryAttempt,
        int $maxRetries,
        ?ResponseInterface $response = null,
    ): bool {
        if ($retryAttempt >= $maxRetries) {
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
