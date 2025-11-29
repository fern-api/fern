<?php

namespace Seed\Service\Types;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

class Resource extends JsonSerializableType
{
    /**
     * @var value-of<ResourceStatus> $status
     */
    #[JsonProperty('status')]
    public string $status;

    /**
     * @var (
     *    'user'
     *   |'Organization'
     *   |'_unknown'
     * ) $resourceType
     */
    public readonly string $resourceType;

    /**
     * @var (
     *    User
     *   |Organization
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   status: value-of<ResourceStatus>,
     *   resourceType: (
     *    'user'
     *   |'Organization'
     *   |'_unknown'
     * ),
     *   value: (
     *    User
     *   |Organization
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->status = $values['status'];$this->resourceType = $values['resourceType'];$this->value = $values['value'];
    }

    /**
     * @param value-of<ResourceStatus> $status
     * @param User $user
     * @return Resource
     */
    public static function user(string $status, User $user): Resource {
        return new Resource([
            'status' => $status,
            'resourceType' => 'user',
            'value' => $user,
        ]);
    }

    /**
     * @param value-of<ResourceStatus> $status
     * @param Organization $organization
     * @return Resource
     */
    public static function organization(string $status, Organization $organization): Resource {
        return new Resource([
            'status' => $status,
            'resourceType' => 'Organization',
            'value' => $organization,
        ]);
    }

    /**
     * @return bool
     */
    public function isUser(): bool {
        return $this->value instanceof User&& $this->resourceType === 'user';
    }

    /**
     * @return User
     */
    public function asUser(): User {
        if (!($this->value instanceof User&& $this->resourceType === 'user')){
            throw new Exception(
                "Expected user; got " . $this->resourceType . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isOrganization(): bool {
        return $this->value instanceof Organization&& $this->resourceType === 'Organization';
    }

    /**
     * @return Organization
     */
    public function asOrganization(): Organization {
        if (!($this->value instanceof Organization&& $this->resourceType === 'Organization')){
            throw new Exception(
                "Expected Organization; got " . $this->resourceType . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return string
     */
    public function __toString(): string {
        return $this->toJson();
    }

    /**
     * @return array<mixed>
     */
    public function jsonSerialize(): array {
        $result = [];
        $result['resource_type'] = $this->resourceType;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->resourceType){
            case 'user':
                $value = $this->asUser()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'Organization':
                $value = $this->asOrganization()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case '_unknown':
            default:
                if (is_null($this->value)){
                    break;
                }
                if ($this->value instanceof JsonSerializableType){
                    $value = $this->value->jsonSerialize();
                    $result = array_merge($value, $result);
                } elseif (is_array($this->value)){
                    $result = array_merge($this->value, $result);
                }
        }
        
        return $result;
    }

    /**
     * @param string $json
     */
    public static function fromJson(string $json): static {
        $decodedJson = JsonDecoder::decode($json);
        if (!is_array($decodedJson)){
            throw new Exception("Unexpected non-array decoded type: " . gettype($decodedJson));
        }
        return self::jsonDeserialize($decodedJson);
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function jsonDeserialize(array $data): static {
        $args = [];
        if (!array_key_exists('status', $data)){
            throw new Exception(
                "JSON data is missing property 'status'",
            );
        }
        if (!($data['status'] instanceof ResourceStatus)){
            throw new Exception(
                "Expected property 'status' in JSON data to be enumString, instead received " . get_debug_type($data['status']),
            );
        }
        $args['status'] = $data['status'];
        
        if (!array_key_exists('resource_type', $data)){
            throw new Exception(
                "JSON data is missing property 'resource_type'",
            );
        }
        $resourceType = $data['resource_type'];
        if (!(is_string($resourceType))){
            throw new Exception(
                "Expected property 'resourceType' in JSON data to be string, instead received " . get_debug_type($data['resource_type']),
            );
        }
        
        $args['resourceType'] = $resourceType;
        switch ($resourceType){
            case 'user':
                $args['value'] = User::jsonDeserialize($data);
                break;
            case 'Organization':
                $args['value'] = Organization::jsonDeserialize($data);
                break;
            case '_unknown':
            default:
                $args['resourceType'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
