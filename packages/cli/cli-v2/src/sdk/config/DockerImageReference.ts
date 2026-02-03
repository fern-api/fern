export interface DockerImageReference {
    /** Image name (e.g. "fernapi/fern-typescript-sdk") */
    image: string;
    /** Image tag (e.g. "1.0.0", "latest", etc) */
    tag: string;
}
