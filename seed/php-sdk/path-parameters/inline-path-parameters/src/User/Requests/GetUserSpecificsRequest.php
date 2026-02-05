<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUserSpecificsRequest extends JsonSerializableType
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
     * @var string $thought
     */
    public string $thought;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   version: int,
     *   thought: string,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->tenantId = $values['tenantId'];
        $this->userId = $values['userId'];
        $this->version = $values['version'];
        $this->thought = $values['thought'];
    }
}
