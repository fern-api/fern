<?php

namespace Seed\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

/**
 * Represents an identity provider connection
 */
class Connection extends JsonSerializableType
{
    /**
     * @var string $id Connection identifier
     */
    #[JsonProperty('id')]
    public string $id;

    /**
     * @var string $name Connection name
     */
    #[JsonProperty('name')]
    public string $name;

    /**
     * @var ?string $displayName Display name for the connection
     */
    #[JsonProperty('display_name')]
    public ?string $displayName;

    /**
     * @var string $strategy The identity provider identifier (auth0, google-oauth2, facebook, etc.)
     */
    #[JsonProperty('strategy')]
    public string $strategy;

    /**
     * @var ?array<string, mixed> $options Connection-specific configuration options
     */
    #[JsonProperty('options'), ArrayType(['string' => 'mixed'])]
    public ?array $options;

    /**
     * @var ?array<string> $enabledClients List of client IDs that can use this connection
     */
    #[JsonProperty('enabled_clients'), ArrayType(['string'])]
    public ?array $enabledClients;

    /**
     * @var ?array<string> $realms Applicable realms for enterprise connections
     */
    #[JsonProperty('realms'), ArrayType(['string'])]
    public ?array $realms;

    /**
     * @var ?bool $isDomainConnection Whether this is a domain connection
     */
    #[JsonProperty('is_domain_connection')]
    public ?bool $isDomainConnection;

    /**
     * @var ?array<string, mixed> $metadata Additional metadata
     */
    #[JsonProperty('metadata'), ArrayType(['string' => 'mixed'])]
    public ?array $metadata;

    /**
     * @param array{
     *   id: string,
     *   name: string,
     *   strategy: string,
     *   displayName?: ?string,
     *   options?: ?array<string, mixed>,
     *   enabledClients?: ?array<string>,
     *   realms?: ?array<string>,
     *   isDomainConnection?: ?bool,
     *   metadata?: ?array<string, mixed>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->id = $values['id'];$this->name = $values['name'];$this->displayName = $values['displayName'] ?? null;$this->strategy = $values['strategy'];$this->options = $values['options'] ?? null;$this->enabledClients = $values['enabledClients'] ?? null;$this->realms = $values['realms'] ?? null;$this->isDomainConnection = $values['isDomainConnection'] ?? null;$this->metadata = $values['metadata'] ?? null;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
