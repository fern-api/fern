<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class AuthorizeResponse extends JsonSerializableType
{
    /**
     * @var string $code
     */
    #[JsonProperty('code')]
    public string $code;

    /**
     * @var ?string $state
     */
    #[JsonProperty('state')]
    public ?string $state;

    /**
     * @param array{
     *   code: string,
     *   state?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->code = $values['code'];
        $this->state = $values['state'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
