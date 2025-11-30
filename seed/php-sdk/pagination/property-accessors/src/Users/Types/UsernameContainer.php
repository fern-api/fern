<?php

namespace Seed\Users\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class UsernameContainer extends JsonSerializableType
{
    /**
     * @var array<string> $results
     */
    #[JsonProperty('results'), ArrayType(['string'])]
    private array $results;

    /**
     * @param array{
     *   results: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->results = $values['results'];
    }

    /**
     * @return array<string>
     */
    public function getResults(): array {
        return $this->results;}

    /**
     * @param array<string> $value
     */
    public function setResults(array $value): self {
        $this->results = $value;return $this;}

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
