<?php

namespace Seed\Exceptions;

use Throwable;
use Seed\Core\Client\Redactor;

/**
 * This exception type will be thrown for any non-2XX API responses.
 */
class SeedApiException extends SeedException
{
    /**
     * @var mixed $body
     */
    private mixed $body;

    /**
     * @param string $message
     * @param int $statusCode
     * @param mixed $body
     * @param ?Throwable $previous
     */
    public function __construct(
        string $message,
        int $statusCode,
        mixed $body,
        ?Throwable $previous = null,
    ) {
        $this->body = $body;
        parent::__construct($message, $statusCode, $previous);
    }

    /**
     * Returns the body of the response that triggered the exception.
     *
     * @return mixed
     */
    public function getBody(): mixed
    {
        return $this->body;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        if (empty($this->body)) {
            return "$this->message; Status Code: $this->code\n";
        }
        $redactedBody = Redactor::redactBody($this->body);
        if (!is_string($redactedBody)) {
            $redactedBody = json_encode($redactedBody) ?: '';
        }
        return "$this->message; Status Code: $this->code; Body: " . $redactedBody . "\n";
    }
}
