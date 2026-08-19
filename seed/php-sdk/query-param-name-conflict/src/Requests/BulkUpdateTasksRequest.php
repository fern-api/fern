<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

class BulkUpdateTasksRequest extends JsonSerializableType
{
    /**
     * @var ?string $filterAssignedTo
     */
    public ?string $filterAssignedTo;

    /**
     * @var ?string $filterIsComplete
     */
    public ?string $filterIsComplete;

    /**
     * @var ?string $filterDate
     */
    public ?string $filterDate;

    /**
     * @var ?string $fields Comma-separated list of fields to include in the response.
     */
    public ?string $fields;

    /**
     * @var ?string $bulkUpdateTasksRequestAssignedTo
     */
    #[JsonProperty('assigned_to')]
    public ?string $bulkUpdateTasksRequestAssignedTo;

    /**
     * @var ?DateTime $bulkUpdateTasksRequestDate
     */
    #[JsonProperty('date'), Date(Date::TYPE_DATE)]
    public ?DateTime $bulkUpdateTasksRequestDate;

    /**
     * @var ?bool $bulkUpdateTasksRequestIsComplete
     */
    #[JsonProperty('is_complete')]
    public ?bool $bulkUpdateTasksRequestIsComplete;

    /**
     * @var ?string $text
     */
    #[JsonProperty('text')]
    public ?string $text;

    /**
     * @param array{
     *   filterAssignedTo?: ?string,
     *   filterIsComplete?: ?string,
     *   filterDate?: ?string,
     *   fields?: ?string,
     *   bulkUpdateTasksRequestAssignedTo?: ?string,
     *   bulkUpdateTasksRequestDate?: ?DateTime,
     *   bulkUpdateTasksRequestIsComplete?: ?bool,
     *   text?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    ) {
        $this->filterAssignedTo = $values['filterAssignedTo'] ?? null;
        $this->filterIsComplete = $values['filterIsComplete'] ?? null;
        $this->filterDate = $values['filterDate'] ?? null;
        $this->fields = $values['fields'] ?? null;
        $this->bulkUpdateTasksRequestAssignedTo = $values['bulkUpdateTasksRequestAssignedTo'] ?? null;
        $this->bulkUpdateTasksRequestDate = $values['bulkUpdateTasksRequestDate'] ?? null;
        $this->bulkUpdateTasksRequestIsComplete = $values['bulkUpdateTasksRequestIsComplete'] ?? null;
        $this->text = $values['text'] ?? null;
    }
}
