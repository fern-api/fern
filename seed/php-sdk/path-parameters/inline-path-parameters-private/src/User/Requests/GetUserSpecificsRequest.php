<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUserSpecificsRequest extends JsonSerializableType
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
     * @var string $thought
     */
    private string $thought;

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

    /**
     * @return string
     */
    public function getThought(): string
    {
        return $this->thought;
    }

    /**
     * @param string $value
     */
    public function setThought(string $value): self
    {
        $this->thought = $value;
        $this->_setField('thought');
        return $this;
    }
}
