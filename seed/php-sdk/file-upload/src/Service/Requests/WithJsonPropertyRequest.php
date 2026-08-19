<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Service\Types\MyObject;
use Seed\Core\Json\JsonProperty;

class WithJsonPropertyRequest extends JsonSerializableType
{
    /**
     * @var File $file
     */
    public File $file;

    /**
     * @var ?MyObject $json
     */
    #[JsonProperty('json')]
    public ?MyObject $json;

    /**
     * @param array{
     *   file: File,
     *   json?: ?MyObject,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->file = $values['file'];
        $this->json = $values['json'] ?? null;
    }
}
