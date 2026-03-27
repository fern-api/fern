<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class StreamRequest extends JsonSerializableType
{
    /**
     * @var ?string $query
     */
    #[JsonProperty('query')]
    public ?string $query;

    /**
     * @param array{
     *   query?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->query = $values['query'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
