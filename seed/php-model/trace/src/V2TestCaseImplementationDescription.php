<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class V2TestCaseImplementationDescription extends JsonSerializableType
{
    /**
     * @var array<V2TestCaseImplementationDescriptionBoard> $boards
     */
    #[JsonProperty('boards'), ArrayType([V2TestCaseImplementationDescriptionBoard::class])]
    public array $boards;

    /**
     * @param array{
     *   boards: array<V2TestCaseImplementationDescriptionBoard>,
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
