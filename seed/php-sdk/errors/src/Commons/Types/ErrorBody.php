<?php

namespace Seed\Commons\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ErrorBody extends JsonSerializableType
{
    /**
     * @var string $message
     */
    #[JsonProperty('message')]
    public string $message;

    /**
     * @var int $code
     */
    #[JsonProperty('code')]
    public int $code;

    /**
     * @param array{
     *   message: string,
     *   code: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->message = $values['message'];$this->code = $values['code'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
