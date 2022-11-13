import { noop } from "@fern-api/core-utils";
import { FernApiEditor } from "@fern-fern/api-editor-sdk";

interface LoggerConfig {
    useLoggerInProduction: boolean;
}

const LOGGER_CONFIG: LoggerConfig = {
    useLoggerInProduction: true,
};

const TRANSACTION_COLOR = "#4169e1";
const FONT_WEIGHT = 700;

export interface TransactionLogger {
    logStateChange(args: {
        transaction: FernApiEditor.transactions.Transaction;
        oldState: FernApiEditor.Api;
        newState: FernApiEditor.Api;
    }): void;
}

const NoopTransactionLogger: TransactionLogger = {
    logStateChange: noop,
};

class DebugTransactionLogger implements TransactionLogger {
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
            console.log("%cPrevious State:", `color: #9E9E9E; font-weight: ${FONT_WEIGHT};`, oldState);
            // eslint-disable-next-line no-console
            console.log("%cTransaction:", `color: ${TRANSACTION_COLOR}; font-weight: ${FONT_WEIGHT};`, transaction);
            // eslint-disable-next-line no-console
            console.log("%cNext State:", `color: #47B04B; font-weight: ${FONT_WEIGHT};`, newState);
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
            throw new Error(
                `[${DebugTransactionLogger.name}] Cannot log group because a group has already been created.`
            );
        }
        this.isInsideGroup = true;
        // eslint-disable-next-line no-console
        console.groupCollapsed(
            "%c[Transaction]",
            `color: ${TRANSACTION_COLOR}; font-weight: ${FONT_WEIGHT};`,
            getTransationSummary(transaction)
        );
    }

    private endGroup() {
        if (!this.isInsideGroup) {
            throw new Error(`[${DebugTransactionLogger.name}] Cannot end group because a group has not been created.`);
        }
        this.isInsideGroup = false;
        // eslint-disable-next-line no-console
        console.groupEnd();
    }
}

function getTransationSummary(transaction: FernApiEditor.transactions.Transaction): string {
    return transaction._visit({
        reorderRootPackages: () => "Reorder root packages",
        createPackage: () => "Create package",
        renamePackage: () => "Rename package",
        deletePackage: () => "Delete package",
        reorderPackages: () => "Reorder packages",
        reorderEndpoints: () => "Reorder endpoints",
        reorderTypes: () => "Reorder types",
        reorderErrors: () => "Reorder errors",
        createEndpoint: () => "Create endpoint",
        renameEndpoint: () => "Rename endpoint",
        deleteEndpoint: () => "Delete endpoin",
        createType: () => "Create type",
        renameType: () => "Rename type",
        setTypeDescription: () => "Set type description",
        setTypeShape: () => "Set type shape",
        deleteType: () => "Delete type",
        createObjectExtension: () => "Create object extension",
        setObjectExtensionType: () => "Set object extension type",
        deleteObjectExtension: () => "Delete object extension",
        createObjectProperty: () => "Create object property",
        renameObjectProperty: () => "Create object property name",
        setObjectPropertyType: () => "Set object property type",
        setObjectPropertyDescription: () => "Set object property description",
        deleteObjectProperty: () => "Delete object property",
        createError: () => "Create error",
        renameError: () => "Rename error",
        deleteError: () => "Delete error",
        _other: ({ type }) => type,
    });
}

export const TransactionLogger =
    process.env.NODE_ENV === "development" || LOGGER_CONFIG.useLoggerInProduction
        ? new DebugTransactionLogger()
        : NoopTransactionLogger;
