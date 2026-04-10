<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class UnauthorizedErrorBody extends JsonSerializableType
{
    /**
     * @var ?value-of<UnauthorizedErrorBodyErrorName> $errorName
     */
    #[JsonProperty('errorName')]
    public ?string $errorName;

    /**
     * @param array{
     *   errorName?: ?value-of<UnauthorizedErrorBodyErrorName>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->errorName = $values['errorName'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
