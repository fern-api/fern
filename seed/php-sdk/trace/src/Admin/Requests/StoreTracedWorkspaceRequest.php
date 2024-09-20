<?php

namespace Seed\Admin\Requests;

use Seed\Submission\Types\WorkspaceRunDetails;
use Seed\Core\JsonProperty;
use Seed\Submission\Types\TraceResponse;
use Seed\Core\ArrayType;

class StoreTracedWorkspaceRequest
{
    /**
     * @var WorkspaceRunDetails $workspaceRunDetails
     */
    #[JsonProperty("workspaceRunDetails")]
    public WorkspaceRunDetails $workspaceRunDetails;

    /**
     * @var array<TraceResponse> $traceResponses
     */
    #[JsonProperty("traceResponses"), ArrayType([TraceResponse::class])]
    public array $traceResponses;

    /**
     * @param array{
     *   workspaceRunDetails: WorkspaceRunDetails,
     *   traceResponses: array<TraceResponse>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->workspaceRunDetails = $values['workspaceRunDetails'];
        $this->traceResponses = $values['traceResponses'];
    }
}
