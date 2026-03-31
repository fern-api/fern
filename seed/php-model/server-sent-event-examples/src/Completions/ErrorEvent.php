<?php

namespace Seed\Completions;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class ErrorEvent extends JsonSerializableType
{
    /**
     * @var string $error
     */
    #[JsonProperty('error')]
    public string $error;

    /**
     * @var ?int $code
     */
    #[JsonProperty('code')]
    public ?int $code;

    /**
     * @param array{
     *   error: string,
     *   code?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->error = $values['error'];
        $this->code = $values['code'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
