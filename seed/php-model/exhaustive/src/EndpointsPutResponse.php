<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class EndpointsPutResponse extends JsonSerializableType
{
    /**
     * @var ?array<EndpointsError> $errors
     */
    #[JsonProperty('errors'), ArrayType([EndpointsError::class])]
    public ?array $errors;

    /**
     * @param array{
     *   errors?: ?array<EndpointsError>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->errors = $values['errors'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
