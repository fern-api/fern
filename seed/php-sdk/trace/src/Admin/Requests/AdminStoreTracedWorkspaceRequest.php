<?php

namespace Seed\Admin\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Types\WorkspaceRunDetails;
use Seed\Core\Json\JsonProperty;
use Seed\Types\TraceResponse;
use Seed\Core\Types\ArrayType;

class AdminStoreTracedWorkspaceRequest extends JsonSerializableType
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
    ) {
        $this->workspaceRunDetails = $values['workspaceRunDetails'];
        $this->traceResponses = $values['traceResponses'];
    }
}
