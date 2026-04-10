<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;
use Seed\Core\Types\Union;

class TestSubmissionStatusTestCaseIdToState extends JsonSerializableType
{
    /**
     * @var ?array<string, (
     *    SubmissionStatusForTestCaseZero
     *   |SubmissionStatusForTestCaseType
     *   |SubmissionStatusForTestCaseTwo
     * )> $value
     */
    #[JsonProperty('value'), ArrayType(['string' => new Union(SubmissionStatusForTestCaseZero::class, SubmissionStatusForTestCaseType::class, SubmissionStatusForTestCaseTwo::class)])]
    public ?array $value;

    /**
     * @param array{
     *   value?: ?array<string, (
     *    SubmissionStatusForTestCaseZero
     *   |SubmissionStatusForTestCaseType
     *   |SubmissionStatusForTestCaseTwo
     * )>,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->value = $values['value'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
