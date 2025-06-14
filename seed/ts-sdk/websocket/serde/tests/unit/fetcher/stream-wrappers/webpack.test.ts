import webpack from "webpack";

describe("test env compatibility", () => {
    test("webpack", () => {
        return new Promise<void>((resolve, reject) => {
            webpack(
                {
                    mode: "production",
                    entry: "./src/index.ts",
                    module: {
                        rules: [
                            {
                                test: /\.tsx?$/,
                                use: "ts-loader",
                                exclude: /node_modules/,
                            },
                        ],
                    },
                    resolve: {
                        extensions: [".tsx", ".ts", ".jsx", ".js"],
                        extensionAlias: {
                            ".js": [".ts", ".js"],
                            ".jsx": [".tsx", ".jsx"],
                        },
                    },
                },
                (err, stats) => {
                    try {
                        expect(err).toBe(null);
                        if (stats?.hasErrors()) {
                            console.log(stats?.toString());
                        }
                        expect(stats?.hasErrors()).toBe(false);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
            );
        });
    }, 180_000);
});
