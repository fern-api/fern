<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\InitializeProblemRequest;
use Seed\Core\Json\JsonProperty;

class SubmissionRequestZero extends JsonSerializableType
{
    use InitializeProblemRequest;

    /**
     * @var value-of<SubmissionRequestZeroType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @param array{
     *   problemId: string,
     *   type: value-of<SubmissionRequestZeroType>,
     *   problemVersion?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->problemId = $values['problemId'];
        $this->problemVersion = $values['problemVersion'] ?? null;
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
