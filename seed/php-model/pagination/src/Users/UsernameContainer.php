<?php

namespace Seed\Users;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class UsernameContainer extends SerializableType
{
    /**
     * @var array<string> $results
     */
    #[JsonProperty('results'), ArrayType(['string'])]
    public array $results;

    /**
     * @param array{
     *   results: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->results = $values['results'];
    }
}
