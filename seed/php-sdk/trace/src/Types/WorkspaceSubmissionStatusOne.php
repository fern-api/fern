<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\Union;

class WorkspaceSubmissionStatusOne extends JsonSerializableType
{
    /**
     * @var value-of<WorkspaceSubmissionStatusOneType> $type
     */
    #[JsonProperty('type')]
    public string $type;

    /**
     * @var (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * )|null $value
     */
    #[JsonProperty('value'), Union(ErrorInfoZero::class, ErrorInfoOne::class, ErrorInfoTwo::class, 'null')]
    public ErrorInfoZero|ErrorInfoOne|ErrorInfoTwo|null $value;

    /**
     * @param array{
     *   type: value-of<WorkspaceSubmissionStatusOneType>,
     *   value?: (
     *    ErrorInfoZero
     *   |ErrorInfoOne
     *   |ErrorInfoTwo
     * )|null,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->type = $values['type'];
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
