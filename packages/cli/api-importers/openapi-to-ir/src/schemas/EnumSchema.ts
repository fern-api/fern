import { z } from "zod";

export const CasingConfigSchema: z.ZodObject<
    {
        snake: z.ZodOptional<z.ZodString>;
        camel: z.ZodOptional<z.ZodString>;
        screamingSnake: z.ZodOptional<z.ZodString>;
        pascal: z.ZodOptional<z.ZodString>;
    },
    "strip",
    z.ZodTypeAny,
    {
        snake?: string | undefined;
        camel?: string | undefined;
        screamingSnake?: string | undefined;
        pascal?: string | undefined;
    },
    {
        snake?: string | undefined;
        camel?: string | undefined;
        screamingSnake?: string | undefined;
        pascal?: string | undefined;
    }
> = z.object({
    snake: z.string().optional(),
    camel: z.string().optional(),
    screamingSnake: z.string().optional(),
    pascal: z.string().optional()
});

export const EnumValueConfigSchema: z.ZodObject<
    {
        description: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        casing: z.ZodOptional<
            z.ZodObject<
                {
                    snake: z.ZodOptional<z.ZodString>;
                    camel: z.ZodOptional<z.ZodString>;
                    screamingSnake: z.ZodOptional<z.ZodString>;
                    pascal: z.ZodOptional<z.ZodString>;
                },
                "strip",
                z.ZodTypeAny,
                {
                    snake?: string | undefined;
                    camel?: string | undefined;
                    screamingSnake?: string | undefined;
                    pascal?: string | undefined;
                },
                {
                    snake?: string | undefined;
                    camel?: string | undefined;
                    screamingSnake?: string | undefined;
                    pascal?: string | undefined;
                }
            >
        >;
    },
    "strip",
    z.ZodTypeAny,
    {
        description?: string | undefined;
        name?: string | undefined;
        casing?:
            | {
                  snake?: string | undefined;
                  camel?: string | undefined;
                  screamingSnake?: string | undefined;
                  pascal?: string | undefined;
              }
            | undefined;
    },
    {
        description?: string | undefined;
        name?: string | undefined;
        casing?:
            | {
                  snake?: string | undefined;
                  camel?: string | undefined;
                  screamingSnake?: string | undefined;
                  pascal?: string | undefined;
              }
            | undefined;
    }
> = z.object({
    description: z.string().optional(),
    name: z.string().optional(),
    casing: CasingConfigSchema.optional()
});

export const FernEnumConfigSchema: z.ZodRecord<
    z.ZodString,
    z.ZodObject<
        {
            description: z.ZodOptional<z.ZodString>;
            name: z.ZodOptional<z.ZodString>;
            casing: z.ZodOptional<
                z.ZodObject<
                    {
                        snake: z.ZodOptional<z.ZodString>;
                        camel: z.ZodOptional<z.ZodString>;
                        screamingSnake: z.ZodOptional<z.ZodString>;
                        pascal: z.ZodOptional<z.ZodString>;
                    },
                    "strip",
                    z.ZodTypeAny,
                    {
                        snake?: string | undefined;
                        camel?: string | undefined;
                        screamingSnake?: string | undefined;
                        pascal?: string | undefined;
                    },
                    {
                        snake?: string | undefined;
                        camel?: string | undefined;
                        screamingSnake?: string | undefined;
                        pascal?: string | undefined;
                    }
                >
            >;
        },
        "strip",
        z.ZodTypeAny,
        {
            description?: string | undefined;
            name?: string | undefined;
            casing?:
                | {
                      snake?: string | undefined;
                      camel?: string | undefined;
                      screamingSnake?: string | undefined;
                      pascal?: string | undefined;
                  }
                | undefined;
        },
        {
            description?: string | undefined;
            name?: string | undefined;
            casing?:
                | {
                      snake?: string | undefined;
                      camel?: string | undefined;
                      screamingSnake?: string | undefined;
                      pascal?: string | undefined;
                  }
                | undefined;
        }
    >
> = z.record(EnumValueConfigSchema);
