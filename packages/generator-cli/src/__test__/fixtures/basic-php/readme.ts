import { FernGeneratorCli } from "../../../configuration/sdk";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.php({
        publishInfo: {
            packageName: "square/square-php-sdk"
        }
    }),
    organization: "basic"
};

export default CONFIG;
