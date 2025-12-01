<?php

namespace Seed\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Seed\Core\Types\ArrayType;

class User extends JsonSerializableType
{
    /**
     * @var string $userName
     */
    #[JsonProperty('userName')]
    public string $userName;

    /**
     * @var array<string> $metadataTags
     */
    #[JsonProperty('metadata_tags'), ArrayType(['string'])]
    public array $metadataTags;

    /**
     * @var array<string, string> $extraProperties
     */
    #[JsonProperty('EXTRA_PROPERTIES'), ArrayType(['string' => 'string'])]
    public array $extraProperties;

    /**
     * @param array{
     *   userName: string,
     *   metadataTags: array<string>,
     *   extraProperties: array<string, string>,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->userName = $values['userName'];$this->metadataTags = $values['metadataTags'];$this->extraProperties = $values['extraProperties'];
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }
}
