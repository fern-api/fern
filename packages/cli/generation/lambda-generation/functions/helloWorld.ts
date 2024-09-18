export const handler = async (event: Record<string, unknown>): Promise<{ statusCode: number; body: string }> => {
    // eslint-disable-next-line no-console
    // const dockerTestRunner = new DockerTestRunner(
    // );
    const binds = [
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-m1jWBIB8Mzl1:/fern/config.json:ro",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-Dz5GdVR2uMJG:/fern/ir.json:ro",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-C4cjTGlze09X:/fern/output",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-spy6Nu0En5eF:/fern/snippet.json",
        "/private/var/folders/s2/r5rd_09d55s4bz55fvpb3mnh0000gn/T/fern-77553-0Az5kdYKMQe3/tmp-77553-L0m8sZa8Duww:/fern/snippet-templates.json"
    ];
    await runDocker({
        imageName: "fernapi/fern-typescript-node-sdk",
        args: [DOCKER_GENERATOR_CONFIG_PATH],
        binds,
        removeAfterCompletion: true
    });
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: event
        })
    };
};
