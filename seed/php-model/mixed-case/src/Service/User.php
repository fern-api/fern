<?php

namespace Seed\Service;

use Seed\Core\SerializableType;
use Seed\Core\JsonProperty;
use Seed\Core\ArrayType;

class User extends SerializableType
{
    /**
     * @var string $userName
     */
    #[JsonProperty("userName")]
    public string $userName;

    /**
     * @var array<string> $metadataTags
     */
    #[JsonProperty("metadata_tags"), ArrayType(["string"])]
    public array $metadataTags;

    /**
     * @var array<string, string> $extraProperties
     */
    #[JsonProperty("EXTRA_PROPERTIES"), ArrayType(["string" => "string"])]
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
    ) {
        $this->userName = $values['userName'];
        $this->metadataTags = $values['metadataTags'];
        $this->extraProperties = $values['extraProperties'];
    }
}
