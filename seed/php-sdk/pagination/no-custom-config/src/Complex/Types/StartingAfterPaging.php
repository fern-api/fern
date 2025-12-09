<?php

namespace Seed\Complex\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StartingAfterPaging extends JsonSerializableType
{
    /**
     * @var int $perPage
     */
    #[JsonProperty('per_page')]
    public int $perPage;

    /**
     * @var ?string $startingAfter
     */
    #[JsonProperty('starting_after')]
    public ?string $startingAfter;

    /**
     * @param array{
     *   perPage: int,
     *   startingAfter?: ?string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->perPage = $values['perPage'];$this->startingAfter = $values['startingAfter'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
