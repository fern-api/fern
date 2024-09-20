<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class GetExecutionSessionStateResponse extends SerializableType
{
    /**
     * @var array<string, ExecutionSessionState> $states
     */
    #[JsonProperty("states"), ArrayType(["string" => ExecutionSessionState::class])]
    public array $states;

    /**
     * @var ?int $numWarmingInstances
     */
    #[JsonProperty("numWarmingInstances")]
    public ?int $numWarmingInstances;

    /**
     * @var array<string> $warmingSessionIds
     */
    #[JsonProperty("warmingSessionIds"), ArrayType(["string"])]
    public array $warmingSessionIds;

    /**
     * @param array{
     *   states: array<string, ExecutionSessionState>,
     *   numWarmingInstances?: ?int,
     *   warmingSessionIds: array<string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->states = $values['states'];
        $this->numWarmingInstances = $values['numWarmingInstances'] ?? null;
        $this->warmingSessionIds = $values['warmingSessionIds'];
    }
}
