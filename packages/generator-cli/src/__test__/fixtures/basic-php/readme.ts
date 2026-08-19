import { FernGeneratorCli } from "../../../configuration/sdk/index.js";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.php({
        publishInfo: {
            packageName: "square/square-php-sdk"
        }
    }),
    organization: "basic"
};

export default CONFIG;
