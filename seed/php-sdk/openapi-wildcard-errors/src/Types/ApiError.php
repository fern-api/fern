<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

/**
 * The shared error body returned for every 4XX and 5XX status.
 */
class ApiError extends JsonSerializableType
{
    /**
     * @var string $errorType
     */
    #[JsonProperty('error_type')]
    public string $errorType;

    /**
     * @var string $errorCode
     */
    #[JsonProperty('error_code')]
    public string $errorCode;

    /**
     * @var string $errorMessage
     */
    #[JsonProperty('error_message')]
    public string $errorMessage;

    /**
     * @var ?string $requestId
     */
    #[JsonProperty('request_id')]
    public ?string $requestId;

    /**
     * @param array{
     *   errorType: string,
     *   errorCode: string,
     *   errorMessage: string,
     *   requestId?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->errorType = $values['errorType'];
        $this->errorCode = $values['errorCode'];
        $this->errorMessage = $values['errorMessage'];
        $this->requestId = $values['requestId'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
