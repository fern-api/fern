<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\StopRequest;
use Seed\Core\Json\JsonProperty;

class SubmissionRequestFour extends JsonSerializableType
{
    use StopRequest;

    /**
     * @var value-of<SubmissionRequestFourType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   submissionId: string,
     *   type: value-of<SubmissionRequestFourType>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
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
