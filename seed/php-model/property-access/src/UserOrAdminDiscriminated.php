<?php

namespace Seed;

use Seed\Core\Json\JsonSerializableType;
use Seed\Core\Json\JsonProperty;
use Exception;
use Seed\Core\Json\JsonDecoder;

/**
 * Example of an discriminated union
 */
class UserOrAdminDiscriminated extends JsonSerializableType
{
    /**
     * @var string $normal
     */
    #[JsonProperty('normal')]
    public string $normal;

    /**
     * @var Foo $foo
     */
    #[JsonProperty('foo')]
    public Foo $foo;

    /**
     * @var (
     *    'user'
     *   |'admin'
     *   |'empty'
     *   |'_unknown'
     * ) $type
     */
    public readonly string $type;

    /**
     * @var (
     *    User
     *   |Admin
     *   |null
     *   |mixed
     * ) $value
     */
    public readonly mixed $value;

    /**
     * @param array{
     *   normal: string,
     *   foo: Foo,
     *   type: (
     *    'user'
     *   |'admin'
     *   |'empty'
     *   |'_unknown'
     * ),
     *   value: (
     *    User
     *   |Admin
     *   |null
     *   |mixed
     * ),
     * } $values
     */
    private function __construct(
        array $values,
    )
    {
        $this->normal = $values['normal'];$this->foo = $values['foo'];$this->type = $values['type'];$this->value = $values['value'];
    }

    /**
     * @param string $normal
     * @param Foo $foo
     * @param User $user
     * @return UserOrAdminDiscriminated
     */
    public static function user(string $normal, Foo $foo, User $user): UserOrAdminDiscriminated {
        return new UserOrAdminDiscriminated([
            'normal' => $normal,
            'foo' => $foo,
            'type' => 'user',
            'value' => $user,
        ]);
    }

    /**
     * @param string $normal
     * @param Foo $foo
     * @param Admin $admin
     * @return UserOrAdminDiscriminated
     */
    public static function admin(string $normal, Foo $foo, Admin $admin): UserOrAdminDiscriminated {
        return new UserOrAdminDiscriminated([
            'normal' => $normal,
            'foo' => $foo,
            'type' => 'admin',
            'value' => $admin,
        ]);
    }

    /**
     * @param string $normal
     * @param Foo $foo
     * @return UserOrAdminDiscriminated
     */
    public static function empty(string $normal, Foo $foo): UserOrAdminDiscriminated {
        return new UserOrAdminDiscriminated([
            'normal' => $normal,
            'foo' => $foo,
            'type' => 'empty',
            'value' => null,
        ]);
    }

    /**
     * @return bool
     */
    public function isUser(): bool {
        return $this->value instanceof User&& $this->type === 'user';
    }

    /**
     * @return User
     */
    public function asUser(): User {
        if (!($this->value instanceof User&& $this->type === 'user')){
            throw new Exception(
                "Expected user; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isAdmin(): bool {
        return $this->value instanceof Admin&& $this->type === 'admin';
    }

    /**
     * @return Admin
     */
    public function asAdmin(): Admin {
        if (!($this->value instanceof Admin&& $this->type === 'admin')){
            throw new Exception(
                "Expected admin; got " . $this->type . " with value of type " . get_debug_type($this->value),
            );
        }
        
        return $this->value;
    }

    /**
     * @return bool
     */
    public function isEmpty(): bool {
        return is_null($this->value)&& $this->type === 'empty';
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
        $result['type'] = $this->type;
        
        $base = parent::jsonSerialize();
        $result = array_merge($base, $result);
        
        switch ($this->type){
            case 'user':
                $value = $this->asUser()->jsonSerialize();
                $result = array_merge($value, $result);
                break;
            case 'admin':
                $value = $this->asAdmin()->jsonSerialize();
                $result['admin'] = $value;
                break;
            case 'empty':
                $result['empty'] = [];
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
        if (!array_key_exists('normal', $data)){
            throw new Exception(
                "JSON data is missing property 'normal'",
            );
        }
        if (!(is_string($data['normal']))){
            throw new Exception(
                "Expected property 'normal' in JSON data to be string, instead received " . get_debug_type($data['normal']),
            );
        }
        $args['normal'] = $data['normal'];
        
        if (!array_key_exists('foo', $data)){
            throw new Exception(
                "JSON data is missing property 'foo'",
            );
        }
        if (!($data['foo'] instanceof Foo)){
            throw new Exception(
                "Expected property 'foo' in JSON data to be reference, instead received " . get_debug_type($data['foo']),
            );
        }
        $args['foo'] = $data['foo'];
        
        if (!array_key_exists('type', $data)){
            throw new Exception(
                "JSON data is missing property 'type'",
            );
        }
        $type = $data['type'];
        if (!(is_string($type))){
            throw new Exception(
                "Expected property 'type' in JSON data to be string, instead received " . get_debug_type($data['type']),
            );
        }
        
        $args['type'] = $type;
        switch ($type){
            case 'user':
                $args['value'] = User::jsonDeserialize($data);
                break;
            case 'admin':
                if (!array_key_exists('admin', $data)){
                    throw new Exception(
                        "JSON data is missing property 'admin'",
                    );
                }
                
                if (!(is_array($data['admin']))){
                    throw new Exception(
                        "Expected property 'admin' in JSON data to be array, instead received " . get_debug_type($data['admin']),
                    );
                }
                $args['value'] = Admin::jsonDeserialize($data['admin']);
                break;
            case 'empty':
                $args['value'] = null;
                break;
            case '_unknown':
            default:
                $args['type'] = '_unknown';
                $args['value'] = $data;
        }
        
        // @phpstan-ignore-next-line
        return new static($args);
    }
}
