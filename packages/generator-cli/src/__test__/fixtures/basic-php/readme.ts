import { FernGeneratorCli } from "../../../configuration/generated";

const CONFIG: FernGeneratorCli.ReadmeConfig = {
    language: FernGeneratorCli.LanguageInfo.php({
        publishInfo: {
            packageName: "square/square-php-sdk"
        }
    }),
    organization: "basic"
};

export default CONFIG;
