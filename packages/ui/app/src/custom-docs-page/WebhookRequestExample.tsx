import { JsonExample } from "../api-page/examples/json-example/JsonExample";
import { TitledExample } from "../api-page/examples/TitledExample";

export declare namespace WebhookRequestExample {
    export interface Props {
        requestExampleJson: unknown;
    }
}

export const WebhookRequestExample: React.FC<WebhookRequestExample.Props> = ({ requestExampleJson }) => {
    return (
        <div className="min-w-md flex max-h-[80vh] min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 grid-rows-[repeat(auto-fit,_minmax(0,_min-content))] flex-col gap-6">
                    <TitledExample
                        title="Payload Example"
                        type="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {(parent) => (
                            <JsonExample json={requestExampleJson} selectedProperty={undefined} parent={parent} />
                        )}
                    </TitledExample>
                </div>
            </div>
        </div>
    );
};
