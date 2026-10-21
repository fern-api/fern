<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class PlaidError extends JsonSerializableType
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
     * @param array{
     *   errorType: string,
     *   errorCode: string,
     *   errorMessage: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->errorType = $values['errorType'];
        $this->errorCode = $values['errorCode'];
        $this->errorMessage = $values['errorMessage'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
