<?php

namespace Seed\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use DateTime;
use Seed\Core\Types\Date;

class BulkUpdateTasksRequest extends JsonSerializableType
{
    /**
     * @var ?string $assignedTo
     */
    public ?string $assignedTo;

    /**
     * @var ?string $isComplete
     */
    public ?string $isComplete;

    /**
     * @var ?string $date
     */
    public ?string $date;

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
     *   assignedTo?: ?string,
     *   isComplete?: ?string,
     *   date?: ?string,
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
        $this->assignedTo = $values['assignedTo'] ?? null;
        $this->isComplete = $values['isComplete'] ?? null;
        $this->date = $values['date'] ?? null;
        $this->fields = $values['fields'] ?? null;
        $this->bulkUpdateTasksRequestAssignedTo = $values['bulkUpdateTasksRequestAssignedTo'] ?? null;
        $this->bulkUpdateTasksRequestDate = $values['bulkUpdateTasksRequestDate'] ?? null;
        $this->bulkUpdateTasksRequestIsComplete = $values['bulkUpdateTasksRequestIsComplete'] ?? null;
        $this->text = $values['text'] ?? null;
    }
}
