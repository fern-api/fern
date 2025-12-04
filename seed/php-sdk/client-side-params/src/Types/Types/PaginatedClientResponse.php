<?php

namespace Seed\Types\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * Paginated response for clients listing
 */
class PaginatedClientResponse extends JsonSerializableType
{
    /**
     * @var int $start Starting index (zero-based)
     */
    #[JsonProperty('start')]
    public int $start;

    /**
     * @var int $limit Number of items requested
     */
    #[JsonProperty('limit')]
    public int $limit;

    /**
     * @var int $length Number of items returned
     */
    #[JsonProperty('length')]
    public int $length;

    /**
     * @var ?int $total Total number of items (when include_totals=true)
     */
    #[JsonProperty('total')]
    public ?int $total;

    /**
     * @var array<Client> $clients List of clients
     */
    #[JsonProperty('clients'), ArrayType([Client::class])]
    public array $clients;

    /**
     * @param array{
     *   start: int,
     *   limit: int,
     *   length: int,
     *   clients: array<Client>,
     *   total?: ?int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->start = $values['start'];$this->limit = $values['limit'];$this->length = $values['length'];$this->total = $values['total'] ?? null;$this->clients = $values['clients'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
