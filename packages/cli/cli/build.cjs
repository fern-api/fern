const { pnpPlugin } = require("@yarnpkg/esbuild-plugin-pnp");
const { build } = require("esbuild");

const options = {
    platform: "node",
    entryPoints: ["./src/cli.ts"],
    outfile: "./dist/bundle.cjs",
    bundle: true,
    plugins: [pnpPlugin()],
    define: {
        "process.env.PACKAGE_VERSION": getEnvironmentVariable("PACKAGE_VERSION"),
        "process.env.AUTH0_DOMAIN": getEnvironmentVariable("AUTH0_DOMAIN"),
        "process.env.AUTH0_CLIENT_ID": getEnvironmentVariable("AUTH0_CLIENT_ID"),
    },
};

function getEnvironmentVariable(environmentVariable) {
    const value = process.env[environmentVariable];
    if (value != null) {
        return `"${value}"`;
    }
    throw new Error(`Environment variable ${environmentVariable} is not defined.`);
}

build(options).catch(() => process.exit(1));
