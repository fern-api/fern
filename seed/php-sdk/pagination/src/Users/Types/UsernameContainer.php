<?php

namespace Seed\Users\Types;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UsernameContainer extends SerializableType
{
    #[JsonProperty("results"), ArrayType(["string"])]
    /**
     * @var array<string> $results
     */
    public array $results;

    /**
     * @param array<string> $results
     */
    public function __construct(
        array $results,
    ) {
        $this->results = $results;
    }
}
