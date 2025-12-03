<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class ListConnectionsRequest extends JsonSerializableType
{
    /**
     * @var ?string $strategy Filter by strategy type (e.g., auth0, google-oauth2, samlp)
     */
    public ?string $strategy;

    /**
     * @var ?string $name Filter by connection name
     */
    public ?string $name;

    /**
     * @var ?string $fields Comma-separated list of fields to include
     */
    public ?string $fields;

    /**
     * @param array{
     *   strategy?: ?string,
     *   name?: ?string,
     *   fields?: ?string,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->strategy = $values['strategy'] ?? null;$this->name = $values['name'] ?? null;$this->fields = $values['fields'] ?? null;
    }
}
