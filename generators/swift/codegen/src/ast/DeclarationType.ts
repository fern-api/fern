export const DeclarationType = {
    /**
     * Variable declaration.
     */
    Var: 'var',
    /**
     * Constant declaration.
     */
    Let: 'let'
} as const

export type DeclarationType = (typeof DeclarationType)[keyof typeof DeclarationType]
