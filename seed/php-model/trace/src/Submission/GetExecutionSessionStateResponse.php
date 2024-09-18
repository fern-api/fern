<?php

namespace Seed\Submission;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;
use Seed\Submission\ExecutionSessionState;

class GetExecutionSessionStateResponse extends SerializableType
{
    #[JsonProperty("states"), ArrayType(["string" => ExecutionSessionState::class])]
    /**
     * @var array<string, ExecutionSessionState> $states
     */
    public array $states;

    #[JsonProperty("warmingSessionIds"), ArrayType(["string"])]
    /**
     * @var array<string> $warmingSessionIds
     */
    public array $warmingSessionIds;

    #[JsonProperty("numWarmingInstances")]
    /**
     * @var ?int $numWarmingInstances
     */
    public ?int $numWarmingInstances;

    /**
     * @param array<string, ExecutionSessionState> $states
     * @param array<string> $warmingSessionIds
     * @param ?int $numWarmingInstances
     */
    public function __construct(
        array $states,
        array $warmingSessionIds,
        ?int $numWarmingInstances = null,
    ) {
        $this->states = $states;
        $this->warmingSessionIds = $warmingSessionIds;
        $this->numWarmingInstances = $numWarmingInstances;
    }
}
