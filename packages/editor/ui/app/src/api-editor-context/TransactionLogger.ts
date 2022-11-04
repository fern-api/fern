import { noop } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";

interface LoggerConfig {
    useLoggerInProduction: boolean;
}

const LOGGER_CONFIG: LoggerConfig = {
    useLoggerInProduction: true,
};

export interface TransactionLogger {
    logStateChange(args: {
        transaction: FernApiEditor.transactions.Transaction;
        oldState: FernApiEditor.Api;
        newState: FernApiEditor.Api;
    }): void;
}

const ProdInkwellLogger: TransactionLogger = {
    logStateChange: noop,
};

class DebugInkwellLogger implements TransactionLogger {
    private isInsideGroup = false;

    public logStateChange({
        transaction,
        oldState,
        newState,
    }: {
        transaction: FernApiEditor.transactions.Transaction;
        oldState: FernApiEditor.Api;
        newState: FernApiEditor.Api;
    }) {
        this.logGroup(transaction, () => {
            // eslint-disable-next-line no-console
            console.log("%cPrevious State:", "color: #9E9E9E; font-weight: 700;", oldState);
            // eslint-disable-next-line no-console
            console.log("%cNext State:", "color: #47B04B; font-weight: 700;", newState);
        });
    }

    private logGroup<T>(transaction: FernApiEditor.transactions.Transaction, run: () => T): T {
        this.beginGroup(transaction);
        const result = run();
        this.endGroup();
        return result;
    }

    private beginGroup(transaction: FernApiEditor.transactions.Transaction) {
        if (this.isInsideGroup) {
            throw new Error("[InkwellLogger] Cannot log group because a group has already been created.");
        }
        this.isInsideGroup = true;
        // eslint-disable-next-line no-console
        console.groupCollapsed("%cTransaction:", "color: #4169e1; font-weight: 700;", transaction);
    }

    private endGroup() {
        if (!this.isInsideGroup) {
            throw new Error("[InkwellLogger] Cannot end group because a group has not been created.");
        }
        this.isInsideGroup = false;
        // eslint-disable-next-line no-console
        console.groupEnd();
    }
}

export const TransactionLogger =
    process.env.NODE_ENV === "development" || LOGGER_CONFIG.useLoggerInProduction
        ? new DebugInkwellLogger()
        : ProdInkwellLogger;
