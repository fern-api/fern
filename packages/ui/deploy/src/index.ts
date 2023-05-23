import { createCdkStack } from "./createCdkStack.js";

export async function deploy({ distDirectory }: { distDirectory: string }): Promise<void> {
    void createCdkStack({ distDirectory });
}
