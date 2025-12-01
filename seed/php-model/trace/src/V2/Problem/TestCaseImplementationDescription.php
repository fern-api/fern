<?php

namespace Seed\V2\Problem;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class TestCaseImplementationDescription extends JsonSerializableType
{
    /**
     * @var array<TestCaseImplementationDescriptionBoard> $boards
     */
    #[JsonProperty('boards'), ArrayType([TestCaseImplementationDescriptionBoard::class])]
    public array $boards;

    /**
     * @param array{
     *   boards: array<TestCaseImplementationDescriptionBoard>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->boards = $values['boards'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
