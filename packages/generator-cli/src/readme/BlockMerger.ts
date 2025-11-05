import type { Block } from "./Block";

export class BlockMerger {
    private original: Block[];
    private originalByID: Record<string, Block> = {};
    private updated: Block[];
    private updatedByID: Record<string, Block> = {};

    constructor({ original, updated }: { original: Block[]; updated: Block[] }) {
        this.original = original;
        this.original.map((block) => {
            this.originalByID[block.id] = block;
        });

        this.updated = updated;
        this.updated.map((block) => {
            this.updatedByID[block.id] = block;
        });
    }

    public merge(): Block[] {
        const merged: BlockList = new BlockList();
        const processedUpdated = new Set<string>();

        // Process each original block in order
        for (const originalBlock of this.original) {
            if (this.blockExistsInUpdated(originalBlock)) {
                // Use the updated version of this block
                const updatedBlock = this.updatedByID[originalBlock.id];
                if (updatedBlock && !processedUpdated.has(updatedBlock.id)) {
                    merged.addBlock(updatedBlock);
                    processedUpdated.add(updatedBlock.id);
                }
            } else {
                // Keep the original block since it's not in updated
                merged.addBlock(originalBlock);
            }
        }

        // Add any new blocks from updated that weren't processed
        for (const [index, updatedBlock] of this.updated.reverse().entries()) {
            if (!processedUpdated.has(updatedBlock.id)) {
                merged.insertBlock(updatedBlock, this.updated[index - 1]?.id);
            }
        }

        return merged.getBlocks();
    }

    private blockExistsInUpdated(block: Block): boolean {
        return this.updatedByID[block.id] !== undefined;
    }
}

class BlockList {
    private ids: Set<string>;
    private blocks: Block[];

    constructor() {
        this.ids = new Set();
        this.blocks = [];
    }

    public addBlock(block: Block): void {
        if (this.hasBlock(block.id)) {
            throw new Error(`block with id "${block.id}" already exists`);
        }
        this.ids.add(block.id);
        this.blocks.push(block);
    }

    // private addBlockToFront(block: Block): void {
    //   if (this.hasBlock(block.id)) {
    //     throw new Error(`block with id "${block.id}" already exists`);
    //   }
    //   this.ids.add(block.id);
    //   this.blocks.unshift(block);
    // }

    public insertBlock(block: Block, precedingBlockId?: string): void {
        if (this.hasBlock(block.id)) {
            throw new Error(`block with id "${block.id}" already exists`);
        }
        if (precedingBlockId === undefined) {
            this.addBlock(block);
            return;
        }
        if (!this.hasBlock(precedingBlockId)) {
            throw new Error(`preceding block with id "${precedingBlockId}" does not exist`);
        }
        this.ids.add(block.id);
        this.blocks.splice(
            this.blocks.findIndex((b) => b.id === precedingBlockId),
            0,
            block
        );
    }

    public hasBlock(id: string): boolean {
        return this.ids.has(id);
    }

    public getBlocks(): Block[] {
        return this.blocks;
    }
}
