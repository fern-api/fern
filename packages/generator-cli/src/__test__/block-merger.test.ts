import { Block } from "../readme/Block.js";
import { BlockMerger } from "../readme/BlockMerger.js";

describe("BlockMerger", () => {
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

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
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
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Duplicate block with id "AUTHENTICATION"')
        );
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
});
