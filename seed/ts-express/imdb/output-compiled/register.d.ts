import type express from "express";
import type { ImdbService } from "./api/resources/imdb/service/ImdbService";
export declare function register(expressApp: express.Express | express.Router, services: {
    imdb: ImdbService;
}): void;
