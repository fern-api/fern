<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Types\RuleCreateRequestExecutionContext;

class RuleCreateRequest extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var value-of<RuleCreateRequestExecutionContext> $executionContext Execution context for the rule, excluding the prod environment.
     */
    #[JsonProperty('executionContext')]
    public string $executionContext;

    /**
     * @param array{
     *   name: string,
     *   executionContext: value-of<RuleCreateRequestExecutionContext>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->executionContext = $values['executionContext'];
    }
}
