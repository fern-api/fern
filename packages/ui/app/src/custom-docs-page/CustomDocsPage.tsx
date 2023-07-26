import { assertNever } from "@fern-api/core-utils";
import classNames from "classnames";
import { useMemo } from "react";
import { Markdown } from "../api-page/markdown/Markdown";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedUrlPath } from "../ResolvedUrlPath";
import { TableOfContents } from "./TableOfContents";
import { paymentRefundRequest } from "./webhook-requests/payment-refund";
import { paymentStatusUpdateRequest } from "./webhook-requests/payment-status-update";
import { WebhookRequestExample } from "./WebhookRequestExample";

export declare namespace CustomDocsPage {
    export interface Props {
        path: ResolvedUrlPath.MarkdownPage | ResolvedUrlPath.MdxPage;
    }
}

export const CustomDocsPage: React.FC<CustomDocsPage.Props> = ({ path }) => {
    const { resolvePage, selectedSlug } = useDocsContext();

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
    const isWebhookPage = isPaymentStatusUpdateWebhookPage || isPaymentRefundWebhookPage;

    let webhookRequestExample;
    if (isPaymentStatusUpdateWebhookPage) {
        webhookRequestExample = paymentStatusUpdateRequest;
    } else if (isPaymentRefundWebhookPage) {
        webhookRequestExample = paymentRefundRequest;
    }

    return (
        <div className="flex justify-center gap-20 overflow-y-auto px-[10vw] pt-[10vh]">
            <div className="w-[750px]">
                <div className="mb-8 text-3xl font-bold">{path.page.title}</div>
                {content}
                <BottomNavigationButtons />
                <div className="h-20" />
            </div>

            {isWebhookPage && (
                <div
                    className={classNames(
                        "flex-1 sticky self-start top-0 min-w-[30rem] max-w-2xl",
                        // the py-10 is the same as the 40px below
                        "py-10",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-[calc(100vh-4rem)]",
                        // hide on mobile,
                        "hidden lg:flex"
                    )}
                    style={{
                        // the 40px is the same as the py-10 above
                        marginTop: 36,
                    }}
                >
                    <WebhookRequestExample requestExampleJson={webhookRequestExample} />
                </div>
            )}

            {!isWebhookPage && (
                <div className="sticky top-0 hidden w-64 shrink-0 md:flex">
                    <TableOfContents markdown={page.markdown} />
                </div>
            )}
        </div>
    );
};
