<?php

namespace Seed;

/**
 * Represents the available environments for the API with multiple base URLs.
 */
class Environments
{
    /**
     * @var string $base
     */
    public readonly string $base;

    /**
     * @var string $auth
     */
    public readonly string $auth;

    /**
     * @param string $base The base base URL
     * @param string $auth The auth base URL
     */
    private function __construct(
        string $base,
        string $auth,
    ) {
        $this->base = $base;
        $this->auth = $auth;
    }

    /**
     * RegionalApiServer environment
     *
     * @return Environments
     */
    public static function RegionalApiServer(): Environments
    {
        return new self(
            base: 'https://api.example.com/v1',
            auth: 'https://auth.example.com'
        );
    }

    /**
     * Create a custom environment with your own URLs
     *
     * @param string $base The base base URL
     * @param string $auth The auth base URL
     * @return Environments
     */
    public static function custom(string $base, string $auth): Environments
    {
        return new self(
            base: $base,
            auth: $auth
        );
    }
}
