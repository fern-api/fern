<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetMetadataRequest extends JsonSerializableType
{
    /**
     * @var ?bool $shallow
     */
    public ?bool $shallow;

    /**
     * @var ?array<string> $tag
     */
    public ?array $tag;

    /**
     * @var string $xApiVersion
     */
    public string $xApiVersion;

    /**
     * @param array{
     *   shallow?: ?bool,
     *   tag?: ?array<string>,
     *   xApiVersion: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->shallow = $values['shallow'] ?? null;
        $this->tag = $values['tag'] ?? null;
        $this->xApiVersion = $values['xApiVersion'];
    }
}
