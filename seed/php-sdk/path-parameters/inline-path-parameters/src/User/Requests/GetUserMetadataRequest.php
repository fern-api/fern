<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUserMetadataRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    public string $tenantId;

    /**
     * @var string $userId
     */
    public string $userId;

    /**
     * @var int $version
     */
    public int $version;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   version: int,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];$this->version = $values['version'];
    }
}
