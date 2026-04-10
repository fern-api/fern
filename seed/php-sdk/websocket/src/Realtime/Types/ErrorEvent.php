<?php

namespace Seed\Realtime\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ErrorEvent extends JsonSerializableType
{
    /**
     * @var int $errorCode
     */
    #[JsonProperty('errorCode')]
    public int $errorCode;

    /**
     * @var string $errorMessage
     */
    #[JsonProperty('errorMessage')]
    public string $errorMessage;

    /**
     * @param array{
     *   errorCode: int,
     *   errorMessage: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
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
