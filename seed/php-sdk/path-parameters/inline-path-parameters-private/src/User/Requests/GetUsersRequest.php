<?php

namespace Seed\User\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetUsersRequest extends JsonSerializableType
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
     * @param array{
     *   tenantId: string,
     *   userId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->userId = $values['userId'];
    }

    /**
     * @return string
     */
    public function getTenantId(): string {
        return $this->tenantId;}

    /**
     * @param string $value
     */
    public function setTenantId(string $value): self {
        $this->tenantId = $value;return $this;}

    /**
     * @return string
     */
    public function getUserId(): string {
        return $this->userId;}

    /**
     * @param string $value
     */
    public function setUserId(string $value): self {
        $this->userId = $value;return $this;}
}
