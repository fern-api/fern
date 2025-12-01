<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Submission\Types\WorkspaceRunDetails;
use Seed\Core\Json\JsonProperty;
use Seed\Submission\Types\TraceResponse;
use Seed\Core\Types\ArrayType;

class StoreTracedWorkspaceRequest extends JsonSerializableType
{
    /**
     * @var WorkspaceRunDetails $workspaceRunDetails
     */
    #[JsonProperty('workspaceRunDetails')]
    public WorkspaceRunDetails $workspaceRunDetails;

    /**
     * @var array<TraceResponse> $traceResponses
     */
    #[JsonProperty('traceResponses'), ArrayType([TraceResponse::class])]
    public array $traceResponses;

    /**
     * @param array{
     *   workspaceRunDetails: WorkspaceRunDetails,
     *   traceResponses: array<TraceResponse>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->workspaceRunDetails = $values['workspaceRunDetails'];$this->traceResponses = $values['traceResponses'];
    }
}
