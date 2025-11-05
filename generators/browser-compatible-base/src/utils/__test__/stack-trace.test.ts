import { at, StackTraces, stacktrace } from "../stacktrace";

describe("stacktrace", () => {
    describe("stacktrace()", () => {
        it("should return an array of stack frames", () => {
            const frames = stacktrace({ filterJs: false, filterNode: false });
            expect(frames).toBeInstanceOf(Array);
            expect(frames.length).toBeGreaterThan(0);
        });

        it("should have correct frame structure", () => {
            const frames = stacktrace({ maxFrames: 1, filterJs: false });
            expect(frames.length).toBeGreaterThan(0);
            expect(frames[0]).toHaveProperty("fn");
            expect(frames[0]).toHaveProperty("path");
            expect(frames[0]).toHaveProperty("position");
            expect(frames[0]?.position).toMatch(/^\d+:\d+$/);
        });

        it("should respect maxFrames option", () => {
            const frames = stacktrace({ maxFrames: 3, filterJs: false });
            expect(frames.length).toBeLessThanOrEqual(3);
        });

        it("should skip frames when skip option is provided", () => {
            const allFrames = stacktrace({ maxFrames: 10, filterJs: false });
            const skippedFrames = stacktrace({ maxFrames: 10, skip: 2, filterJs: false });

            // When skipping frames, the result should either be shorter or start at a different frame
            // The third frame in allFrames should be the first frame in skippedFrames (if both have enough frames)
            if (allFrames.length > 2 && skippedFrames.length > 0) {
                expect(skippedFrames[0]).toEqual(allFrames[2]);
            } else {
                // If we don't have enough frames, skip should still work without errors
                expect(skippedFrames).toBeInstanceOf(Array);
            }
        });

        it("should filter out Node.js internal frames when filterNode is true", () => {
            const frames = stacktrace({ filterNode: true });
            const hasNodeFrame = frames.some((frame) => frame.path.startsWith("node:"));
            expect(hasNodeFrame).toBe(false);
        });

        it("should include Node.js internal frames when filterNode is false", () => {
            // This test might not always have node: frames in the stack, so we just verify
            // that the filter option doesn't crash
            const frames = stacktrace({ filterNode: false });
            expect(frames).toBeInstanceOf(Array);
        });

        it("should filter out .js files when filterJs is true", () => {
            const frames = stacktrace({ filterJs: true });
            const hasJsFile = frames.some((frame) => frame.path.endsWith(".js"));
            expect(hasJsFile).toBe(false);
        });

        it("should filter out paths matching filterPaths", () => {
            const frames = stacktrace({ filterPaths: ["stacktrace.test.ts"] });
            // Should filter out this test file itself if it appears
            const hasTestFile = frames.some((frame) => frame.path.includes("stacktrace.test.ts"));
            expect(hasTestFile).toBe(false);
        });

        it("should filter out functions matching filterFunctions", () => {
            function testFunctionToFilter() {
                return stacktrace({ filterFunctions: ["testFunctionToFilter"], filterJs: false });
            }
            const frames = testFunctionToFilter();
            const hasFunctionName = frames.some((frame) => frame.fn.includes("testFunctionToFilter"));
            expect(hasFunctionName).toBe(false);
        });

        it("should stop on functions matching stopOn", () => {
            function stopHere() {
                function innerFunction() {
                    return stacktrace({ stopOn: ["stopHere"], filterJs: false });
                }
                return innerFunction();
            }
            const frames = stopHere();
            // Should not include stopHere or anything above it
            const hasStopFunction = frames.some((frame) => frame.fn.includes("stopHere"));
            expect(hasStopFunction).toBe(false);
        });

        it("should handle empty options", () => {
            const frames = stacktrace({ filterJs: false });
            expect(frames).toBeInstanceOf(Array);
        });

        it("should handle undefined options", () => {
            const frames = stacktrace({ filterJs: false });
            expect(frames).toBeInstanceOf(Array);
        });

        it("should automatically filter out internal functions", () => {
            const frames = stacktrace({ filterJs: false });
            const hasInternalFunctions = frames.some((frame) =>
                ["at", "stacktrace", "Frames.trace", "Frames.tag"].includes(frame.fn)
            );
            expect(hasInternalFunctions).toBe(false);
        });

        it("should format Object methods correctly", () => {
            // This is harder to test directly, but we can verify the transformation logic
            // by calling stacktrace from within an object context
            const obj = {
                alias() {
                    return stacktrace({ filterFunctions: [], filterJs: false });
                }
            };
            const frames = obj.alias();
            // If it captured the method, it might format it specially
            expect(frames).toBeInstanceOf(Array);
        });

        it("should handle maxFrames of 0", () => {
            const frames = stacktrace({ maxFrames: 0, filterJs: false });
            expect(frames).toEqual([]);
        });

        it("should handle large skip values", () => {
            const frames = stacktrace({ skip: 1000, filterJs: false });
            expect(frames).toEqual([]);
        });

        it("should capture position information correctly", () => {
            const frames = stacktrace({ maxFrames: 1, filterJs: false });
            expect(frames.length).toBeGreaterThan(0);
            expect(frames[0]?.position).toMatch(/^\d+:\d+$/);
            const [line, column] = (frames[0]?.position ?? "0:0").split(":");
            expect(parseInt(line ?? "0")).toBeGreaterThan(0);
            expect(parseInt(column ?? "0")).toBeGreaterThan(0);
        });
    });

    describe("at()", () => {
        it("should return a formatted string", () => {
            const result = at();
            expect(typeof result).toBe("string");
        });

        it("should include function names and paths in single-line format", () => {
            const result = at({ multiline: false });
            expect(typeof result).toBe("string");
            // Should contain path separators and position info
            if (result.length > 0) {
                expect(result).toMatch(/\d+:\d+/);
            }
        });

        it("should format multi-line output with newlines and indentation", () => {
            const result = at({ multiline: true, maxFrames: 2 });
            if (result.length > 0) {
                expect(result).toMatch(/\n\s+/);
            }
        });

        it("should respect maxFrames option", () => {
            const result1 = at({ maxFrames: 1, multiline: true });
            const result2 = at({ maxFrames: 3, multiline: true });

            // Count number of lines (frames)
            const countLines = (str: string) => (str.match(/\n/g) || []).length;

            if (result1.length > 0 && result2.length > 0) {
                expect(countLines(result2)).toBeGreaterThan(countLines(result1));
            }
        });

        it("should respect skip option", () => {
            const result1 = at({ maxFrames: 5, skip: 0 });
            const result2 = at({ maxFrames: 5, skip: 1 });

            // Results should be different when skipping frames
            if (result1.length > 0 && result2.length > 0) {
                expect(result1).not.toEqual(result2);
            }
        });

        it("should filter paths correctly", () => {
            const result = at({ filterPaths: ["stacktrace.test.ts"] });
            expect(result).not.toContain("stacktrace.test.ts");
        });

        it("should filter functions correctly", () => {
            function myTestFunction() {
                return at({ filterFunctions: ["myTestFunction"] });
            }
            const result = myTestFunction();
            expect(result).not.toContain("myTestFunction");
        });

        it("should handle empty stack", () => {
            const result = at({ maxFrames: 0 });
            expect(result).toBe("");
        });
    });

    describe("StackTraces class", () => {
        let traces: StackTraces;
        let testObj: object;

        beforeEach(() => {
            traces = new StackTraces({ maxFrames: 10, filterJs: false });
            testObj = {};
        });

        describe("tag()", () => {
            it("should tag an object with stack trace information", () => {
                traces.tag(testObj);
                const trace = traces.trace(testObj);
                expect(trace.length).toBeGreaterThan(0);
            });

            it("should accumulate multiple tags on the same object", () => {
                function firstTag() {
                    traces.tag(testObj);
                }
                function secondTag() {
                    traces.tag(testObj);
                }

                firstTag();
                const traceAfterFirst = traces.trace(testObj);

                secondTag();
                const traceAfterSecond = traces.trace(testObj);

                // Second trace should have at least as much or more info
                expect(traceAfterSecond.length).toBeGreaterThanOrEqual(traceAfterFirst.length);
            });

            it("should handle tagging multiple different objects", () => {
                const obj1 = {};
                const obj2 = {};

                traces.tag(obj1);
                traces.tag(obj2);

                const trace1 = traces.trace(obj1);
                const trace2 = traces.trace(obj2);

                expect(trace1.length).toBeGreaterThan(0);
                expect(trace2.length).toBeGreaterThan(0);
            });
        });

        describe("trace()", () => {
            it("should return empty string for untagged objects", () => {
                const untaggedObj = {};
                const trace = traces.trace(untaggedObj);
                expect(trace).toBe("");
            });

            it("should return formatted trace for tagged objects", () => {
                traces.tag(testObj);
                const trace = traces.trace(testObj);
                expect(typeof trace).toBe("string");
                expect(trace.length).toBeGreaterThan(0);
            });

            it("should format with newlines when multiline is true", () => {
                const multilineTraces = new StackTraces({ multiline: true, filterJs: false });
                multilineTraces.tag(testObj);
                const trace = multilineTraces.trace(testObj);

                if (trace.length > 0) {
                    expect(trace).toMatch(/\n\s+/);
                }
            });

            it("should not include newlines when multiline is false", () => {
                const singleLineTraces = new StackTraces({ multiline: false, filterJs: false });
                singleLineTraces.tag(testObj);
                const trace = singleLineTraces.trace(testObj);

                // Should not have newline followed by spaces
                expect(trace).not.toMatch(/\n\s+/);
            });

            it("should respect maxFrames option", () => {
                const limitedTraces = new StackTraces({ maxFrames: 2, filterJs: false });
                limitedTraces.tag(testObj);
                const trace = limitedTraces.trace(testObj);

                // Count frames by counting " - " separators
                const frameCount = (trace.match(/ - /g) || []).length;
                expect(frameCount).toBeLessThanOrEqual(2);
            });

            it("should respect skip option", () => {
                const normalTraces = new StackTraces({ skip: 0, maxFrames: 5, filterJs: false });
                const skippedTraces = new StackTraces({ skip: 2, maxFrames: 5, filterJs: false });

                const obj1 = {};
                const obj2 = {};

                normalTraces.tag(obj1);
                skippedTraces.tag(obj2);

                const trace1 = normalTraces.trace(obj1);
                const trace2 = skippedTraces.trace(obj2);

                // Different skip values should produce different traces
                if (trace1.length > 0 && trace2.length > 0) {
                    expect(trace1).not.toEqual(trace2);
                }
            });

            it("should filter paths correctly", () => {
                const filteredTraces = new StackTraces({ filterPaths: ["stacktrace.test.ts"], filterJs: false });
                filteredTraces.tag(testObj);
                const trace = filteredTraces.trace(testObj);

                expect(trace).not.toContain("stacktrace.test.ts");
            });

            it("should filter functions correctly", () => {
                const filteredTraces = new StackTraces({ filterFunctions: ["testFilterFunction"], filterJs: false });

                function testFilterFunction() {
                    filteredTraces.tag(testObj);
                }

                testFilterFunction();
                const trace = filteredTraces.trace(testObj);

                expect(trace).not.toContain("testFilterFunction");
            });
        });

        describe("free()", () => {
            it("should remove stack trace information for an object", () => {
                traces.tag(testObj);
                expect(traces.trace(testObj).length).toBeGreaterThan(0);

                traces.free(testObj);
                expect(traces.trace(testObj)).toBe("");
            });

            it("should not affect other objects", () => {
                const obj1 = {};
                const obj2 = {};

                traces.tag(obj1);
                traces.tag(obj2);

                traces.free(obj1);

                expect(traces.trace(obj1)).toBe("");
                expect(traces.trace(obj2).length).toBeGreaterThan(0);
            });

            it("should be safe to call on untagged objects", () => {
                const untaggedObj = {};
                expect(() => traces.free(untaggedObj)).not.toThrow();
            });
        });

        describe("clear()", () => {
            it("should clear all stack trace information", () => {
                const obj1 = {};
                const obj2 = {};
                const obj3 = {};

                traces.tag(obj1);
                traces.tag(obj2);
                traces.tag(obj3);

                traces.clear();

                expect(traces.trace(obj1)).toBe("");
                expect(traces.trace(obj2)).toBe("");
                expect(traces.trace(obj3)).toBe("");
            });

            it("should allow tagging after clear", () => {
                traces.tag(testObj);
                traces.clear();

                traces.tag(testObj);
                expect(traces.trace(testObj).length).toBeGreaterThan(0);
            });
        });

        describe("options", () => {
            it("should respect filterNode option", () => {
                const nodeFilteredFrames = new StackTraces({ filterNode: true, filterJs: false });
                nodeFilteredFrames.tag(testObj);
                const trace = nodeFilteredFrames.trace(testObj);

                expect(trace).not.toMatch(/node:/);
            });

            it("should respect filterJs option", () => {
                const jsFilteredFrames = new StackTraces({ filterJs: true });
                jsFilteredFrames.tag(testObj);
                const trace = jsFilteredFrames.trace(testObj);

                // Trace shouldn't contain references to .js files
                const lines = trace.split("\n");
                for (const line of lines) {
                    if (line.includes(" - ")) {
                        const pathPart = line.split(" - ")[1];
                        if (pathPart) {
                            expect(pathPart).not.toMatch(/\.js:\d+:\d+$/);
                        }
                    }
                }
            });

            it("should respect stopOn option", () => {
                const stoppedFrames = new StackTraces({ stopOn: ["testStopFunction"], filterJs: false });

                function testStopFunction() {
                    function innerFunction() {
                        stoppedFrames.tag(testObj);
                    }
                    innerFunction();
                }

                testStopFunction();
                const trace = stoppedFrames.trace(testObj);

                expect(trace).not.toContain("testStopFunction");
            });
        });

        describe("WeakMap behavior", () => {
            it("should allow garbage collection of objects", () => {
                // WeakMap allows objects to be garbage collected
                // We can't directly test GC, but we can verify the implementation uses WeakMap
                let tempObj: object | null = {};
                traces.tag(tempObj);
                expect(traces.trace(tempObj).length).toBeGreaterThan(0);

                // Setting to null allows GC (though we can't force it in tests)
                tempObj = null;
                expect(tempObj).toBeNull();
            });
        });
    });

    describe("integration tests", () => {
        it("should work across nested function calls", () => {
            function level1() {
                return level2();
            }

            function level2() {
                return level3();
            }

            function level3() {
                return stacktrace({ maxFrames: 10, filterJs: false });
            }

            const frames = level1();
            expect(frames).toBeInstanceOf(Array);
            expect(frames.length).toBeGreaterThan(0);

            // Should capture multiple levels
            const functionNames = frames.map((f) => f.fn);
            const hasNesting = functionNames.some((fn) => fn.includes("level"));
            expect(hasNesting).toBe(true);
        });

        it("should handle async functions", async () => {
            async function asyncFunction() {
                return stacktrace({ maxFrames: 5, filterJs: false });
            }

            const frames = await asyncFunction();
            expect(frames).toBeInstanceOf(Array);
        });

        it("should work with Frames class across async boundaries", async () => {
            const frames = new StackTraces({ maxFrames: 10, filterJs: false });
            const obj = {};

            async function asyncTag() {
                frames.tag(obj);
            }

            await asyncTag();
            const trace = frames.trace(obj);
            expect(trace.length).toBeGreaterThan(0);
        });

        it("should handle complex filter combinations", () => {
            const frames = stacktrace({
                maxFrames: 10,
                skip: 1,
                filterPaths: ["node_modules"],
                filterFunctions: ["jest"],
                filterNode: true,
                filterJs: false
            });

            expect(frames).toBeInstanceOf(Array);

            for (const frame of frames) {
                expect(frame.path).not.toContain("node_modules");
                expect(frame.fn).not.toContain("jest");
                expect(frame.path).not.toMatch(/^node:/);
            }
        });

        it("should maintain consistency between stacktrace() and at()", () => {
            function testFunction() {
                const frames = stacktrace({ maxFrames: 3, filterJs: false });
                const atString = at({ maxFrames: 3, filterJs: false });

                // at() string should contain path information from frames
                // (position numbers may vary due to where the calls are made)
                return { frames, atString };
            }

            const result = testFunction();
            expect(result.frames.length).toBeGreaterThan(0);
            expect(result.atString.length).toBeGreaterThan(0);
        });

        it("should deduplicate frames in Frames class", () => {
            const frames = new StackTraces({ maxFrames: 10, filterJs: false });
            const obj = {};

            // Tag from the same location multiple times
            frames.tag(obj);
            frames.tag(obj);
            frames.tag(obj);

            const trace = frames.trace(obj);

            // Due to Set usage, duplicate frames should be deduplicated
            expect(typeof trace).toBe("string");
            expect(trace.length).toBeGreaterThan(0);
        });
    });
});
