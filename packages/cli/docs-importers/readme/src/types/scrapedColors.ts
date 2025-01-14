export type scrapedColors = {
    primary: string;
    light?: string;
    dark?: string;
    background?: {
        light?: string;
        dark?: string;
    };
    anchors?:
        | string
        | {
              from: string;
              via?: string;
              to: string;
          };
};
