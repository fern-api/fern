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
     * @var string $upload
     */
    public readonly string $upload;

    /**
     * @param string $base The base base URL
     * @param string $auth The auth base URL
     * @param string $upload The upload base URL
     */
    private function __construct(
        string $base,
        string $auth,
        string $upload,
    ) {
        $this->base = $base;
        $this->auth = $auth;
        $this->upload = $upload;
    }

    /**
     * Production environment
     *
     * @return Environments
     */
    public static function Production(): Environments
    {
        return new self(
            base: 'https://api.example.com/2.0',
            auth: 'https://auth.example.com/oauth2',
            upload: 'https://upload.example.com/2.0'
        );
    }

    /**
     * Create a custom environment with your own URLs
     *
     * @param string $base The base base URL
     * @param string $auth The auth base URL
     * @param string $upload The upload base URL
     * @return Environments
     */
    public static function custom(string $base, string $auth, string $upload): Environments
    {
        return new self(
            base: $base,
            auth: $auth,
            upload: $upload
        );
    }
}
