<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListClientsRequest extends JsonSerializableType
{
    /**
     * @var ?string $fields Comma-separated list of fields to include
     */
    public ?string $fields;

    /**
     * @var ?bool $includeFields Whether specified fields are included or excluded
     */
    public ?bool $includeFields;

    /**
     * @var ?int $page Page number (zero-based)
     */
    public ?int $page;

    /**
     * @var ?int $perPage Number of results per page
     */
    public ?int $perPage;

    /**
     * @var ?bool $includeTotals Include total count in response
     */
    public ?bool $includeTotals;

    /**
     * @var ?bool $isGlobal Filter by global clients
     */
    public ?bool $isGlobal;

    /**
     * @var ?bool $isFirstParty Filter by first party clients
     */
    public ?bool $isFirstParty;

    /**
     * @var ?array<string> $appType Filter by application type (spa, native, regular_web, non_interactive)
     */
    public ?array $appType;

    /**
     * @param array{
     *   fields?: ?string,
     *   includeFields?: ?bool,
     *   page?: ?int,
     *   perPage?: ?int,
     *   includeTotals?: ?bool,
     *   isGlobal?: ?bool,
     *   isFirstParty?: ?bool,
     *   appType?: ?array<string>,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->fields = $values['fields'] ?? null;$this->includeFields = $values['includeFields'] ?? null;$this->page = $values['page'] ?? null;$this->perPage = $values['perPage'] ?? null;$this->includeTotals = $values['includeTotals'] ?? null;$this->isGlobal = $values['isGlobal'] ?? null;$this->isFirstParty = $values['isFirstParty'] ?? null;$this->appType = $values['appType'] ?? null;
    }
}
