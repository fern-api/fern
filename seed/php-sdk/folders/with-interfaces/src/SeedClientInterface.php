<?php

namespace Seed;

use Seed\\ClientInterface;
use Seed\Ab\AbClientInterface;
use Seed\Ac\AcClientInterface;
use Seed\Folder\FolderClientInterface;
use Seed\FolderService\FolderServiceClientInterface;

interface SeedClientInterface 
{
    /**
     * @return ClientInterface
     */
    public function get(): ClientInterface;

    /**
     * @return AbClientInterface
     */
    public function getAb(): AbClientInterface;

    /**
     * @return AcClientInterface
     */
    public function getAc(): AcClientInterface;

    /**
     * @return FolderClientInterface
     */
    public function getFolder(): FolderClientInterface;

    /**
     * @return FolderServiceClientInterface
     */
    public function getFolderService(): FolderServiceClientInterface;
}
