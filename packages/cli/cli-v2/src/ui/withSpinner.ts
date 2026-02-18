import ora from "ora";

export async function withSpinner<T>(message: string, operation: () => Promise<T>): Promise<T> {
    const spinner = ora({
        text: message,
        indent: 2,
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
