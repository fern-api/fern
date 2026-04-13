<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class ServiceGetMetadataRequest extends JsonSerializableType
{
    /**
     * @var ?bool $shallow
     */
    public ?bool $shallow;

    /**
     * @var ?array<?string> $tag
     */
    public ?array $tag;

    /**
     * @var string $apiVersion
     */
    public string $apiVersion;

    /**
     * @param array{
     *   apiVersion: string,
     *   shallow?: ?bool,
     *   tag?: ?array<?string>,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->shallow = $values['shallow'] ?? null;
        $this->tag = $values['tag'] ?? null;
        $this->apiVersion = $values['apiVersion'];
    }
}
