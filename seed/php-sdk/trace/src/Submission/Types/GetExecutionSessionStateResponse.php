<?php

namespace Seed\Submission\Types;

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
     * @var array<string> $warmingSessionIds
     */
    #[JsonProperty("warmingSessionIds"), ArrayType(["string"])]
    public array $warmingSessionIds;

    /**
     * @var ?int $numWarmingInstances
     */
    #[JsonProperty("numWarmingInstances")]
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
