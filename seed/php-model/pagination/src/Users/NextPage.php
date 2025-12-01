<?php

namespace Seed\Users;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class NextPage extends JsonSerializableType
{
    /**
     * @var int $page
     */
    #[JsonProperty('page')]
    public int $page;

    /**
     * @var string $startingAfter
     */
    #[JsonProperty('starting_after')]
    public string $startingAfter;

    /**
     * @param array{
     *   page: int,
     *   startingAfter: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->page = $values['page'];$this->startingAfter = $values['startingAfter'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
