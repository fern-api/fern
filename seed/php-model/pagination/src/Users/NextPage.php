<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;

class NextPage extends SerializableType
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
    ) {
        $this->page = $values['page'];
        $this->startingAfter = $values['startingAfter'];
    }
}
