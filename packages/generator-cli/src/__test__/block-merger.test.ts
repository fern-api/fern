import { afterEach, describe, expect, it, vi } from "vitest";
import { Block } from "../readme/Block.js";
import { BlockMerger } from "../readme/BlockMerger.js";

describe("BlockMerger", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("merges updated blocks with original blocks by ID", () => {
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nOld content\n" }),
            new Block({ id: "USAGE", content: "## Usage\nOld usage\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nOld contributing\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew content\n" }),
            new Block({ id: "USAGE", content: "## Usage\nNew usage\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew contributing\n" })
        ];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        expect(result).toHaveLength(3);
        expect(result[0]?.content).toContain("New content");
        expect(result[1]?.content).toContain("New usage");
        expect(result[2]?.content).toContain("New contributing");
    });

    it("preserves original blocks not in updated", () => {
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "CUSTOM_SECTION", content: "## Custom\nUser content\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nContributing\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew content\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew contributing\n" })
        ];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        expect(result).toHaveLength(3);
        expect(result[0]?.id).toBe("INSTALLATION");
        expect(result[1]?.id).toBe("CUSTOM_SECTION");
        expect(result[1]?.content).toContain("User content");
        expect(result[2]?.id).toBe("CONTRIBUTING");
    });

    it("warns and overrides when original has duplicate block IDs", () => {
        // Previously this crashed with 'block with id "AUTHENTICATION" already exists',
        // causing README deletion. Now it warns and keeps the last duplicate.
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "USAGE", content: "## Usage\nUsage content\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nFirst auth block\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nSecond auth block (duplicate)\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nContributing\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew\n" }),
            new Block({ id: "USAGE", content: "## Usage\nNew\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew\n" })
        ];

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        // Should not crash — duplicates are resolved by keeping the last one
        expect(result).toHaveLength(4);
        expect(result[0]?.id).toBe("INSTALLATION");
        expect(result[1]?.id).toBe("USAGE");
        // The second (last) AUTHENTICATION block wins
        expect(result[2]?.id).toBe("AUTHENTICATION");
        expect(result[2]?.content).toContain("Second auth block");
        expect(result[3]?.id).toBe("CONTRIBUTING");

        // Should have warned about the duplicate
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Duplicate block with id "AUTHENTICATION"'));
        warnSpy.mockRestore();
    });

    it("merges correctly when AUTHENTICATION is a stable feature block", () => {
        // With Fix 3: AUTHENTICATION is a proper feature block with a unique ID.
        // No duplicates, so BlockMerger works correctly.
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "USAGE", content: "## Usage\nUsage content\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nAuth content\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nContributing\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew\n" }),
            new Block({ id: "USAGE", content: "## Usage\nNew\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nUpdated auth\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew\n" })
        ];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        expect(result).toHaveLength(4);
        expect(result[0]?.id).toBe("INSTALLATION");
        expect(result[1]?.id).toBe("USAGE");
        expect(result[2]?.id).toBe("AUTHENTICATION");
        expect(result[2]?.content).toContain("Updated auth");
        expect(result[3]?.id).toBe("CONTRIBUTING");
    });

    it("adds new blocks from updated that are not in original", () => {
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nContributing\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nNew auth block\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew\n" })
        ];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        // AUTHENTICATION is new — it should be inserted
        expect(result).toHaveLength(3);
        expect(result.map((b) => b.id)).toContain("AUTHENTICATION");
    });

    it("handles empty original blocks gracefully", () => {
        const original: Block[] = [];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "USAGE", content: "## Usage\nUsage\n" })
        ];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        expect(result).toHaveLength(2);
        expect(result[0]?.id).toBe("INSTALLATION");
        expect(result[1]?.id).toBe("USAGE");
    });

    it("handles empty updated blocks gracefully", () => {
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "USAGE", content: "## Usage\nUsage\n" })
        ];
        const updated: Block[] = [];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        // All original blocks preserved since none are in updated
        expect(result).toHaveLength(2);
        expect(result[0]?.id).toBe("INSTALLATION");
        expect(result[0]?.content).toContain("Content");
        expect(result[1]?.id).toBe("USAGE");
    });

    it("insertBlock warns exactly once when duplicate block with undefined precedingBlockId", () => {
        // Regression test for Devin Review finding: insertBlock now deletes from this.ids
        // before delegating to addBlock, preventing a double-warn.
        // We test this via the merge() path: when updated has a block not in original,
        // it goes through insertBlock. If the same ID is already in merged (from original),
        // insertBlock fires one warn, delegates to addBlock which adds it cleanly.
        const original = [
            new Block({ id: "USAGE", content: "## Usage\nOld\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nOld\n" })
        ];
        // Updated has USAGE (will be merged via original loop) + a NEW block
        // that will go through insertBlock path
        const updated = [
            new Block({ id: "USAGE", content: "## Usage\nNew\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew\n" })
        ];

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        // All blocks from updated replace original, no new insertions needed
        expect(result).toHaveLength(2);
        expect(result[0]?.id).toBe("USAGE");
        expect(result[0]?.content).toContain("New");
        // No duplicates means no warnings
        expect(warnSpy).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });

    it("preserves block ordering from original when merging", () => {
        // Original has a specific order; merged result should respect it
        const original = [
            new Block({ id: "REQUIREMENTS", content: "## Requirements\nJava 8+\n" }),
            new Block({ id: "INSTALLATION", content: "## Installation\nOld\n" }),
            new Block({ id: "USAGE", content: "## Usage\nOld usage\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nOld auth\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nOld\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew\n" }),
            new Block({ id: "USAGE", content: "## Usage\nNew usage\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nNew auth\n" }),
            new Block({ id: "CONTRIBUTING", content: "## Contributing\nNew\n" })
        ];

        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        expect(result).toHaveLength(5);
        // REQUIREMENTS is preserved in its original position
        expect(result[0]?.id).toBe("REQUIREMENTS");
        expect(result[0]?.content).toContain("Java 8+");
        expect(result[1]?.id).toBe("INSTALLATION");
        expect(result[1]?.content).toContain("New");
        expect(result[2]?.id).toBe("USAGE");
        expect(result[3]?.id).toBe("AUTHENTICATION");
        expect(result[3]?.content).toContain("New auth");
        expect(result[4]?.id).toBe("CONTRIBUTING");
    });

    it("handles triple duplicate block IDs in original without crashing", () => {
        // Extreme edge case: three duplicate blocks in original.
        // The constructor's originalByID silently keeps the last duplicate.
        // merge() iterates the original array: the first AUTHENTICATION matches updated
        // and is added to merged + processedUpdated. The 2nd and 3rd are skipped because
        // processedUpdated already has the ID. No duplicate addBlock call → no warn needed.
        const original = [
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nFirst\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nSecond\n" }),
            new Block({ id: "AUTHENTICATION", content: "## Authentication\nThird\n" })
        ];
        const updated = [new Block({ id: "AUTHENTICATION", content: "## Authentication\nUpdated\n" })];

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        // Should collapse all three duplicates into one updated block
        const authBlocks = result.filter((b) => b.id === "AUTHENTICATION");
        expect(authBlocks).toHaveLength(1);
        expect(authBlocks[0]?.content).toContain("Updated");

        warnSpy.mockRestore();
    });

    it("warns when original duplicates are not in updated (both kept via addBlock)", () => {
        // When original has duplicates and they are NOT in updated,
        // both go through the else branch → addBlock is called twice with the same ID → warn fires.
        const original = [
            new Block({ id: "CUSTOM", content: "## Custom\nFirst\n" }),
            new Block({ id: "CUSTOM", content: "## Custom\nSecond\n" })
        ];
        const updated = [new Block({ id: "INSTALLATION", content: "## Installation\nNew\n" })];

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original, updated });
        const result = merger.merge();

        // addBlock is called twice with CUSTOM (not in updated) → warn fires, second overrides first
        const customBlocks = result.filter((b) => b.id === "CUSTOM");
        expect(customBlocks).toHaveLength(1);
        expect(customBlocks[0]?.content).toContain("Second");
        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Duplicate block with id "CUSTOM"'));

        warnSpy.mockRestore();
    });

    it("does not warn when there are no duplicates", () => {
        const original = [
            new Block({ id: "INSTALLATION", content: "## Installation\nContent\n" }),
            new Block({ id: "USAGE", content: "## Usage\nUsage\n" })
        ];
        const updated = [
            new Block({ id: "INSTALLATION", content: "## Installation\nNew\n" }),
            new Block({ id: "USAGE", content: "## Usage\nNew\n" })
        ];

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {
            // intentionally empty — suppress console.warn during test
        });
        const merger = new BlockMerger({ original, updated });
        merger.merge();

        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });
});
