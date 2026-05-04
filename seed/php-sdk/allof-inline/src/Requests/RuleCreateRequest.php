<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Types\RuleExecutionContext;

class RuleCreateRequest extends JsonSerializableType
{
    /**
     * @var string $name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var value-of<RuleExecutionContext> $executionContext
     */
    #[JsonProperty('executionContext')]
    public string $executionContext;

    /**
     * @param array{
     *   name: string,
     *   executionContext: value-of<RuleExecutionContext>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->name = $values['name'];
        $this->executionContext = $values['executionContext'];
    }
}
