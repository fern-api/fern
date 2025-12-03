<?php

namespace Seed\Service\Requests;

use Seed\Core\Json\JsonSerializableType;
use Seed\Utils\File;
use Seed\Core\Json\JsonProperty;

class OptionalArgsRequest extends JsonSerializableType
{
    /**
     * @var ?File $imageFile
     */
    public ?File $imageFile;

    /**
     * @var mixed $request
     */
    #[JsonProperty('request')]
    public mixed $request;

    /**
     * @param array{
     *   imageFile?: ?File,
     *   request?: mixed,
     * } $values
     */
    public function __construct(
        array $values = [],
    )
    {
        $this->imageFile = $values['imageFile'] ?? null;$this->request = $values['request'] ?? null;
    }
}
