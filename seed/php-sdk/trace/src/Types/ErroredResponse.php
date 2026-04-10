<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class ErroredResponse extends JsonSerializableType
{
    /**
     * @var string $submissionId
     */
    #[JsonProperty('submissionId')]
    public string $submissionId;

    /**
     * @var (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * ) $errorInfo
     */
    #[JsonProperty('errorInfo'), Union(ErrorInfoZero::class, ErrorInfoOne::class, ErrorInfoTwo::class)]
    public ErrorInfoZero|ErrorInfoOne|ErrorInfoTwo $errorInfo;

    /**
     * @param array{
     *   submissionId: string,
     *   errorInfo: (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * ),
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->submissionId = $values['submissionId'];
        $this->errorInfo = $values['errorInfo'];
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
