import ora from "ora";

export async function withSpinner<T>({
    message,
    operation,
    indent
}: {
    message: string;
    operation: () => Promise<T>;
    indent?: number;
}): Promise<T> {
    const spinner = ora({
        text: message,
        indent: indent ?? 0,
        color: "cyan"
    }).start();
    try {
        const result = await operation();
        spinner.stop();
        return result;
    } catch (error: unknown) {
        spinner.stop();
        throw error;
    }
}
