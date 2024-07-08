import { File } from "./ast";

// Breakdown the language and create functionality here. 
// Checkout Swift or CSharp for more inspiration
// export function makeFunction(args: SOME_FUNCTION_TYPE.Args): SOME_FUNCTION_TYPE {
//   return new SOME_FUNCTION_TYPE(args);
// }

export function makeFile(args: File.Args): File {
  return new File(args);
}

export {
  File
} from "./ast";

