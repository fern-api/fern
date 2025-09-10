Error.stackTraceLimit = 25;

export function stacktrace(): { fn: string; path: string; position: string }[] {
  return (new Error().stack ?? "")
        .split("\n")
        .map((line) => {
            const match = line.match(/at\s+(.*)\s+\((.*):(\d+):(\d+)\)/);
            if (match && match.length === 5) {
                let [, fn, path, line, column] = match;
                switch(fn) {
                  case "Object.<anonymous>":
                    fn = "";
                    break;
                  case "Object.object":
                  case "Object.alias":
                  case "Object.union":
                  case "Object.enum":
                  case "Object.undiscriminatedUnion":
                    fn = `${fn.substring(fn.indexOf(".")+1)}()=> { ... }`;
                    break;
                }
                return { fn, path, position: `${line}:${column}` };
            }
            return undefined;
        })
        .filter((each) => 
          each
        && "stacktrace" !== each.fn 
        && !each.path?.startsWith("node:") 
        && !each.path?.endsWith(".js")
        && each.fn !== "Object.classReference"
        && !each.fn?.includes("SdkGeneratorCLI")
        && !each.fn?.includes("runCli")
      ) as {
        fn: string;
        path: string;
        position: string;
    }[];
}