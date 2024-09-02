import { z } from "zod";
import { CursorPaginationSchema } from "./CursorPaginationSchema";
import { OffsetPaginationSchema } from "./OffsetPaginationSchema";

export const PaginationSchema = z.union([CursorPaginationSchema, OffsetPaginationSchema]);

export type PaginationSchema = z.infer<typeof PaginationSchema>;
