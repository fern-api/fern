<?php

namespace Seed\Submission;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class GetExecutionSessionStateResponse extends JsonSerializableType
{
    /**
     * @var array<string, ExecutionSessionState> $states
     */
    #[JsonProperty('states'), ArrayType(['string' => ExecutionSessionState::class])]
    public array $states;

    /**
     * @var ?int $numWarmingInstances
     */
    #[JsonProperty('numWarmingInstances')]
    public ?int $numWarmingInstances;

    /**
     * @var array<string> $warmingSessionIds
     */
    #[JsonProperty('warmingSessionIds'), ArrayType(['string'])]
    public array $warmingSessionIds;

    /**
     * @param array{
     *   states: array<string, ExecutionSessionState>,
     *   warmingSessionIds: array<string>,
     *   numWarmingInstances?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->states = $values['states'];$this->numWarmingInstances = $values['numWarmingInstances'] ?? null;$this->warmingSessionIds = $values['warmingSessionIds'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
