<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2V3TestCaseImplementationDescription extends JsonSerializableType
{
    /**
     * @var array<V2V3TestCaseImplementationDescriptionBoard> $boards
     */
    #[JsonProperty('boards'), ArrayType([V2V3TestCaseImplementationDescriptionBoard::class])]
    public array $boards;

    /**
     * @param array{
     *   boards: array<V2V3TestCaseImplementationDescriptionBoard>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->boards = $values['boards'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
