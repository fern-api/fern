<?php

namespace Seed\Endpoints\Put\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class PutResponse extends JsonSerializableType
{
    /**
     * @var ?array<Error> $errors
     */
    #[JsonProperty('errors'), ArrayType([Error::class])]
    public ?array $errors;

    /**
     * @param array{
     *   errors?: ?array<Error>,
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
