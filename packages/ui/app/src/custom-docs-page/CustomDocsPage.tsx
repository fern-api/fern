import { assertNever } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useMemo } from "react";
import { ApiDefinitionContextProvider } from "../api-context/ApiDefinitionContextProvider";
import { EndpointSection } from "../api-page/endpoints/EndpointSection";
import { Markdown } from "../api-page/markdown/Markdown";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { TableOfContents } from "./TableOfContents";
import { disputeOpenRequest } from "./webhook-request-examples/dispute-open";
import { disputeStatusRequest } from "./webhook-request-examples/dispute-status";
import { paymentRefundRequest } from "./webhook-request-examples/payment-refund";
import { paymentStatusUpdateRequest } from "./webhook-request-examples/payment-status-update";
import { WebhookRequestExample } from "./WebhookRequestExample";
import { WebhookRequestSection } from "./WebhookRequestSection";

export declare namespace CustomDocsPage {
    export interface Props {
        path: ResolvedUrlPath.MarkdownPage | ResolvedUrlPath.MdxPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ path }) => {
    const { resolvePage, selectedSlug, docsDefinition } = useDocsContext();

    const page = useMemo(() => resolvePage(path.page.id), [path.page.id, resolvePage]);

    const content = useMemo(() => {
        switch (path.type) {
            case "markdown-page":
                return <Markdown type="markdown">{path.markdownContent}</Markdown>;
            case "mdx-page":
                return <MdxContent mdx={path.serializedMdxContent} />;
            default:
                assertNever(path);
        }
    }, [path]);

    // TODO: Remove after demo
    const isPaymentStatusUpdateWebhookPage =
        selectedSlug != null && selectedSlug.endsWith("primer-webhooks/payment-status-update");
    const isPaymentRefundWebhookPage = selectedSlug != null && selectedSlug.endsWith("primer-webhooks/payment-refund");
    const isDisputeOpenWebhookPage = selectedSlug != null && selectedSlug.endsWith("primer-webhooks/dispute-open");
    const isDisputeStatusWebhookPage = selectedSlug != null && selectedSlug.endsWith("primer-webhooks/dispute-status");
    const isWebhookPage =
        isPaymentStatusUpdateWebhookPage ||
        isPaymentRefundWebhookPage ||
        isDisputeOpenWebhookPage ||
        isDisputeStatusWebhookPage;

    let webhookRequestExample;
    let webhookRequestSchema = "";
    if (isPaymentStatusUpdateWebhookPage) {
        webhookRequestExample = paymentStatusUpdateRequest;
        webhookRequestSchema = "type_:PaymentStatusWebhookPayload";
    } else if (isPaymentRefundWebhookPage) {
        webhookRequestExample = paymentRefundRequest;
        webhookRequestSchema = "type_:PaymentRefundWebhookPayload";
    } else if (isDisputeOpenWebhookPage) {
        webhookRequestExample = disputeOpenRequest;
        webhookRequestSchema = "type_:DisputeOpenWebhookPayload";
    } else if (isDisputeStatusWebhookPage) {
        webhookRequestExample = disputeStatusRequest;
        webhookRequestSchema = "type_:DisputeStatusWebhookPayload";
    }

    const firstApiId = Object.keys(docsDefinition.apis)[0];

    if (firstApiId == null) {
        return null;
    }

    return (
        <div className="flex justify-center gap-20 overflow-y-auto px-[10vw] pt-[10vh]">
            <div className={classNames({ "w-[750px]": !isWebhookPage })}>
                <div className="mb-8 text-3xl font-bold">{path.page.title}</div>
                {content}
                {isWebhookPage && (
                    <ApiDefinitionContextProvider
                        apiSection={{
                            api: firstApiId as FernRegistryApiRead.ApiDefinition["id"],
                            title: "",
                            urlSlug: "",
                        }}
                        apiSlug={firstApiId}
                    >
                        <div className="border-border mt-10 flex space-x-12 border-t pt-5">
                            <div className="min-w-lg">
                                <EndpointSection title="Payload">
                                    <WebhookRequestSection
                                        httpRequestBody={{
                                            type: "reference",
                                            value: {
                                                type: "id",
                                                value: FernRegistryApiRead.TypeId(webhookRequestSchema),
                                            },
                                        }}
                                    />
                                </EndpointSection>
                            </div>

                            <WebhookRequestExample requestExampleJson={webhookRequestExample} />
                        </div>
                    </ApiDefinitionContextProvider>
                )}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>

            {!isWebhookPage && (
                <div className="sticky top-0 hidden w-64 shrink-0 md:flex">
                    <TableOfContents markdown={page.markdown} />
                </div>
            )}
        </div>
    );
};
