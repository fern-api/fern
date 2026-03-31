<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUserMetadataRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    private string $tenantId;

    /**
     * @var string $userId
     */
    private string $userId;

    /**
     * @var int $version
     */
    private int $version;

    /**
     * @param array{
     *   tenantId: string,
     *   userId: string,
     *   version: int,
     * } $values
     */
    public function __construct(
        array $values,
    ) {
        $this->tenantId = $values['tenantId'];
        $this->userId = $values['userId'];
        $this->version = $values['version'];
    }

    /**
     * @return string
     */
    public function getTenantId(): string
    {
        return $this->tenantId;
    }

    /**
     * @param string $value
     */
    public function setTenantId(string $value): self
    {
        $this->tenantId = $value;
        $this->_setField('tenantId');
        return $this;
    }

    /**
     * @return string
     */
    public function getUserId(): string
    {
        return $this->userId;
    }

    /**
     * @param string $value
     */
    public function setUserId(string $value): self
    {
        $this->userId = $value;
        $this->_setField('userId');
        return $this;
    }

    /**
     * @return int
     */
    public function getVersion(): int
    {
        return $this->version;
    }

    /**
     * @param int $value
     */
    public function setVersion(int $value): self
    {
        $this->version = $value;
        $this->_setField('version');
        return $this;
    }
}
