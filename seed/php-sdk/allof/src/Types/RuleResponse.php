<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Traits\AuditInfo;
use Seed\Core\Json\JsonProperty;
use DateTime;

class RuleResponse extends JsonSerializableType
{
    use AuditInfo;

    /**
     * @var string $id
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var value-of<RuleResponseStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @var ?value-of<RuleExecutionContext> $executionContext
     */
    #[JsonProperty('executionContext')]
    public ?string $executionContext;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   status: value-of<RuleResponseStatus>,
     *   createdBy?: ?string,
     *   createdDateTime?: ?DateTime,
     *   modifiedBy?: ?string,
     *   modifiedDateTime?: ?DateTime,
     *   executionContext?: ?value-of<RuleExecutionContext>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->createdBy = $values['createdBy'] ?? null;
        $this->createdDateTime = $values['createdDateTime'] ?? null;
        $this->modifiedBy = $values['modifiedBy'] ?? null;
        $this->modifiedDateTime = $values['modifiedDateTime'] ?? null;
        $this->id = $values['id'];
        $this->name = $values['name'];
        $this->status = $values['status'];
        $this->executionContext = $values['executionContext'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string
    {
        return $this->toJson();
    }
}
