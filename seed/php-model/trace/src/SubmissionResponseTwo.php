<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;

class SubmissionResponseTwo extends JsonSerializableType
{
    /**
     * @var value-of<SubmissionResponseTwoType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   type: value-of<SubmissionResponseTwoType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
