<?php

namespace Seed\Calls\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class Call extends JsonSerializableType
{
    /**
     * @var ?string $sid
     */
    #[JsonProperty('sid')]
    public ?string $sid;

    /**
     * @param array{
     *   sid?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->sid = $values['sid'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
