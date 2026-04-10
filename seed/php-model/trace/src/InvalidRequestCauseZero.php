<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\SubmissionIdNotFound;
use Seed\Core\Json\JsonProperty;

class InvalidRequestCauseZero extends JsonSerializableType
{
    use SubmissionIdNotFound;

    /**
     * @var value-of<InvalidRequestCauseZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   missingSubmissionId: string,
     *   type: value-of<InvalidRequestCauseZeroType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->missingSubmissionId = $values['missingSubmissionId'];
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
