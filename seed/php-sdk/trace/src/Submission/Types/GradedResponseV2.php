<?php

namespace Seed\Submission\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GradedResponseV2 extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var array<string, mixed> $testCases
     */
    #[JsonProperty('testCases'), ArrayType(['string' => 'mixed'])]
    public array $testCases;

    /**
     * @param array{
     *   submissionId: string,
     *   testCases: array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->testCases = $values['testCases'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
