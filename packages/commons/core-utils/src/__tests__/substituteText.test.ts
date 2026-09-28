import { vi } from "vitest";

import {
    chainSubstitutionSources,
    ENV_SUBSTITUTION_SOURCE,
    mapSubstitutionSource,
    substituteText
} from "../substituteText.js";

describe("substituteText", () => {
    it("substitutes from a static map, including inside nested objects and arrays", () => {
        const source = mapSubstitutionSource({ version: "v26.7.0", minor_version: "26.7" });
        const content = {
            title: "GPU Operator ${minor_version}",
            pages: ["helm install gpu-operator --version=${version}", { body: "Release ${version}" }]
        };
        const onError = vi.fn();

        const substituted = substituteText(content, source, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual({
            title: "GPU Operator 26.7",
            pages: ["helm install gpu-operator --version=v26.7.0", { body: "Release v26.7.0" }]
        });
    });

    it("reports unresolved names with the generic message", () => {
        const onError = vi.fn();

        substituteText("${missing}", mapSubstitutionSource({}), { onError });

        expect(onError).toHaveBeenCalledWith("Substitution missing is not defined.");
    });

    it("allows the caller to customize the unresolved-name message", () => {
        const onError = vi.fn();

        substituteText(
            "${missing}",
            mapSubstitutionSource({}),
            { onError },
            {
                undefinedMessage: (name) => `no value for ${name}`
            }
        );

        expect(onError).toHaveBeenCalledWith("no value for missing");
    });

    it("does not resolve names from the environment when only a map source is given", () => {
        process.env.ONLY_IN_ENV = "env-value";
        const onError = vi.fn();

        const substituted = substituteText("${ONLY_IN_ENV}", mapSubstitutionSource({}), { onError });

        expect(onError).toHaveBeenCalledTimes(1);
        expect(substituted).toEqual("");
    });

    it("keeps escaped patterns literal", () => {
        const onError = vi.fn();

        const substituted = substituteText(
            "export FOO=\\$\\{NVIDIA_CONTAINER_TOOLKIT_VERSION\\} # ${version}",
            mapSubstitutionSource({ version: "1.20.1" }),
            { onError }
        );

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("export FOO=${NVIDIA_CONTAINER_TOOLKIT_VERSION} # 1.20.1");
    });

    it("replaces every template with an empty string when substituteAsEmpty is set", () => {
        const onError = vi.fn();

        const substituted = substituteText(
            "${version}-${missing}",
            mapSubstitutionSource({ version: "1.0" }),
            { onError },
            { substituteAsEmpty: true }
        );

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("-");
    });

    it("treats a map entry with an empty string as defined", () => {
        const onError = vi.fn();

        const substituted = substituteText("[${suffix}]", mapSubstitutionSource({ suffix: "" }), { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("[]");
    });

    it("does not resolve inherited object properties", () => {
        const onError = vi.fn();

        substituteText("${toString}", mapSubstitutionSource({}), { onError });

        expect(onError).toHaveBeenCalledTimes(1);
    });

    describe("chainSubstitutionSources", () => {
        it("prefers earlier sources and falls back to later ones", () => {
            process.env.CHAINED_FROM_ENV = "from-env";
            process.env.OVERRIDDEN = "from-env";
            const source = chainSubstitutionSources(
                mapSubstitutionSource({ OVERRIDDEN: "from-map" }),
                ENV_SUBSTITUTION_SOURCE
            );
            const onError = vi.fn();

            const substituted = substituteText("${OVERRIDDEN} ${CHAINED_FROM_ENV}", source, { onError });

            expect(onError).toHaveBeenCalledTimes(0);
            expect(substituted).toEqual("from-map from-env");
        });

        it("reports names that no source resolves", () => {
            const source = chainSubstitutionSources(mapSubstitutionSource({}), ENV_SUBSTITUTION_SOURCE);
            const onError = vi.fn();

            substituteText("${NOT_ANYWHERE_AT_ALL}", source, { onError });

            expect(onError).toHaveBeenCalledTimes(1);
        });
    });
});
