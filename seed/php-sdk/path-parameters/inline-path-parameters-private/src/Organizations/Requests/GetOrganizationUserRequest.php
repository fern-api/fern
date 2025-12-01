<?php

namespace Seed\Organizations\Requests;

use Seed\Core\Json\JsonSerializableType;

class GetOrganizationUserRequest extends JsonSerializableType
{
    /**
     * @var string $tenantId
     */
    private string $tenantId;

    /**
     * @var string $organizationId
     */
    private string $organizationId;

    /**
     * @var string $userId
     */
    private string $userId;

    /**
     * @param array{
     *   tenantId: string,
     *   organizationId: string,
     *   userId: string,
     * } $values
     */
    public function __construct(
        array $values,
    )
    {
        $this->tenantId = $values['tenantId'];$this->organizationId = $values['organizationId'];$this->userId = $values['userId'];
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
    public function getOrganizationId(): string {
        return $this->organizationId;}

    /**
     * @param string $value
     */
    public function setOrganizationId(string $value): self {
        $this->organizationId = $value;return $this;}

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
