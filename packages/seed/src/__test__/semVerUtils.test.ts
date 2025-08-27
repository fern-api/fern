import {
    ChangelogEntryType,
    ReleaseRequest
} from "@fern-fern/generators-sdk/api/resources/generators/resources/commons/types";

import {
    assertValidSemVerChangeOrThrow,
    assertValidSemVerOrThrow,
    hasFeatureLevelSemVerChange,
    InvalidSemVerError,
    isValidSemVerChange,
    SemVer
} from "../commands/validate/semVerUtils";

describe("SemVer.fromString", () => {
    it("should parse valid semver without prerelease", () => {
        const semver = SemVer.fromString("1.2.3");
        expect(semver.major).toBe(1);
        expect(semver.minor).toBe(2);
        expect(semver.patch).toBe(3);
        expect(semver.prerelease).toBeUndefined();
    });

    it("should parse valid semver with prerelease", () => {
        const semver = SemVer.fromString("1.2.3-rc5");
        expect(semver.major).toBe(1);
        expect(semver.minor).toBe(2);
        expect(semver.patch).toBe(3);
        expect(semver.prerelease).toBe(5);
    });

    it("should parse valid semver with rc0", () => {
        const semver = SemVer.fromString("1.2.3-rc0");
        expect(semver.major).toBe(1);
        expect(semver.minor).toBe(2);
        expect(semver.patch).toBe(3);
        expect(semver.prerelease).toBe(0);
    });

    it("should throw error for invalid semver format", () => {
        expect(() => SemVer.fromString("1.2")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("1.2.3.4")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("invalid")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("1.2.3-")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("1.2.3-rc")).toThrow(InvalidSemVerError);
    });

    it("should throw error for non-numeric version parts", () => {
        expect(() => SemVer.fromString("a.2.3")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("1.b.3")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("1.2.c")).toThrow(InvalidSemVerError);
        expect(() => SemVer.fromString("1.2.3-rca")).toThrow(InvalidSemVerError);
    });
});

describe("SemVer.toString", () => {
    it("should format semver without prerelease", () => {
        const semver = new SemVer(1, 2, 3);
        expect(semver.toString()).toBe("1.2.3");
    });

    it("should format semver with prerelease", () => {
        const semver = new SemVer(1, 2, 3, 5);
        expect(semver.toString()).toBe("1.2.3-rc5");
    });

    it("should format semver with rc0", () => {
        const semver = new SemVer(1, 2, 3, 0);
        expect(semver.toString()).toBe("1.2.3-rc0");
    });
});

describe("isValidSemVerChange", () => {
    describe("major version changes", () => {
        it("should allow valid major version increment", () => {
            const current = new SemVer(2, 0, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(true);
        });

        it("should reject major version increment with non-zero minor", () => {
            const current = new SemVer(2, 1, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject major version increment with non-zero patch", () => {
            const current = new SemVer(2, 0, 1);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject major version increment with prerelease", () => {
            const current = new SemVer(2, 0, 0, 1);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject major version increment by more than 1", () => {
            const current = new SemVer(3, 0, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject major version decrement", () => {
            const current = new SemVer(1, 0, 0);
            const previous = new SemVer(2, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });
    });

    describe("minor version changes", () => {
        it("should allow valid minor version increment", () => {
            const current = new SemVer(1, 6, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(true);
        });

        it("should reject minor version increment with non-zero patch", () => {
            const current = new SemVer(1, 6, 1);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject minor version increment with prerelease", () => {
            const current = new SemVer(1, 6, 0, 1);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject minor version increment by more than 1", () => {
            const current = new SemVer(1, 7, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject minor version decrement", () => {
            const current = new SemVer(1, 4, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });
    });

    describe("patch version changes", () => {
        it("should allow valid patch version increment", () => {
            const current = new SemVer(1, 5, 11);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(true);
        });

        it("should reject patch version increment with prerelease", () => {
            const current = new SemVer(1, 5, 11, 1);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject patch version increment by more than 1", () => {
            const current = new SemVer(1, 5, 12);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject patch version decrement", () => {
            const current = new SemVer(1, 5, 9);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });
    });

    describe("prerelease version changes", () => {
        it("should reject no version change without prerelease", () => {
            const current = new SemVer(1, 5, 10);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should allow prerelease when previous is not prerelease", () => {
            const current = new SemVer(1, 5, 10, 1);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(true);
        });

        it("should allow valid prerelease increment", () => {
            const current = new SemVer(1, 5, 10, 2);
            const previous = new SemVer(1, 5, 10, 1);
            expect(isValidSemVerChange(current, previous)).toBe(true);
        });

        it("should reject prerelease increment by more than 1", () => {
            const current = new SemVer(1, 5, 10, 3);
            const previous = new SemVer(1, 5, 10, 1);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should reject prerelease decrement", () => {
            const current = new SemVer(1, 5, 10, 0);
            const previous = new SemVer(1, 5, 10, 1);
            expect(isValidSemVerChange(current, previous)).toBe(false);
        });

        it("should allow rc0 when previous is not prerelease", () => {
            const current = new SemVer(1, 5, 10, 0);
            const previous = new SemVer(1, 5, 10);
            expect(isValidSemVerChange(current, previous)).toBe(true);
        });
    });
});

describe("assertValidSemVerOrThrow", () => {
    it("should not throw for valid semver", () => {
        expect(() => assertValidSemVerOrThrow("1.2.3")).not.toThrow();
        expect(() => assertValidSemVerOrThrow("1.2.3-rc5")).not.toThrow();
    });

    it("should throw for invalid semver", () => {
        expect(() => assertValidSemVerOrThrow("1.2")).toThrow(InvalidSemVerError);
        expect(() => assertValidSemVerOrThrow("invalid")).toThrow(InvalidSemVerError);
    });
});

describe("assertValidSemVerChangeOrThrow", () => {
    const createMockReleaseRequest = (version: string, hasFeature = false): ReleaseRequest =>
        ({
            version,
            changelogEntry: hasFeature ? [{ type: ChangelogEntryType.Feat, message: "New feature" }] : undefined
        }) as ReleaseRequest;

    describe("basic semver validation", () => {
        it("should not throw for valid semver change", () => {
            const current = createMockReleaseRequest("1.2.3");
            const previous = createMockReleaseRequest("1.2.2");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).not.toThrow();
        });

        it("should throw for invalid semver change", () => {
            const current = createMockReleaseRequest("1.2.4");
            const previous = createMockReleaseRequest("1.2.2");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).toThrow(InvalidSemVerError);
        });
    });

    describe("feature change validation", () => {
        it("should not throw for feature change with valid minor version increment", () => {
            const current = createMockReleaseRequest("1.3.0", true);
            const previous = createMockReleaseRequest("1.2.0");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).not.toThrow();
        });

        it("should not throw for feature change with valid major version increment", () => {
            const current = createMockReleaseRequest("2.0.0", true);
            const previous = createMockReleaseRequest("1.5.0");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).not.toThrow();
        });

        it("should throw for feature change with only patch version increment", () => {
            const current = createMockReleaseRequest("1.2.3", true);
            const previous = createMockReleaseRequest("1.2.2");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).toThrow(InvalidSemVerError);
        });

        it("should throw for feature change with prerelease only", () => {
            const current = createMockReleaseRequest("1.2.2-rc1", true);
            const previous = createMockReleaseRequest("1.2.2");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).toThrow(InvalidSemVerError);
        });
    });

    describe("non-feature change validation", () => {
        it("should not throw for non-feature change with valid semver", () => {
            const current = createMockReleaseRequest("1.2.3");
            const previous = createMockReleaseRequest("1.2.2");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).not.toThrow();
        });

        it("should not throw for non-feature change with prerelease", () => {
            const current = createMockReleaseRequest("1.2.2-rc1");
            const previous = createMockReleaseRequest("1.2.2");

            expect(() => assertValidSemVerChangeOrThrow(current, previous)).not.toThrow();
        });
    });
});

describe("hasFeatureLevelSemVerChange", () => {
    it("should return true for major version change", () => {
        const current = new SemVer(2, 0, 0);
        const previous = new SemVer(1, 5, 10);
        expect(hasFeatureLevelSemVerChange(current, previous)).toBe(true);
    });

    it("should return true for minor version change", () => {
        const current = new SemVer(1, 6, 0);
        const previous = new SemVer(1, 5, 10);
        expect(hasFeatureLevelSemVerChange(current, previous)).toBe(true);
    });

    it("should return false for patch version change only", () => {
        const current = new SemVer(1, 5, 11);
        const previous = new SemVer(1, 5, 10);
        expect(hasFeatureLevelSemVerChange(current, previous)).toBe(false);
    });

    it("should return false for prerelease change only", () => {
        const current = new SemVer(1, 5, 10, 1);
        const previous = new SemVer(1, 5, 10);
        expect(hasFeatureLevelSemVerChange(current, previous)).toBe(false);
    });

    it("should return false for no version change", () => {
        const current = new SemVer(1, 5, 10);
        const previous = new SemVer(1, 5, 10);
        expect(hasFeatureLevelSemVerChange(current, previous)).toBe(false);
    });
});
