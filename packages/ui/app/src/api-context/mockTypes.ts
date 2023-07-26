import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";

export const mockTypes = {
    "type_:PaymentStatusWebhookPayload": {
        name: "PaymentStatusWebhookPayload",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The type of the webhook raised. `PAYMENT.STATUS` in this case.",
                    key: "eventType",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The date-time that the webhook was sent.",
                    key: "date",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The notification configuration details.",
                    key: "notificationConfig",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentStatusWebhookPayloadNotificationConfig",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The payload version",
                    key: "version",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Timestamp when the webhook content was signed",
                    key: "signedAt",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "payment",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentStatusWebhookPayloadPayment",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentStatusWebhookPayloadNotificationConfig": {
        description: "The notification configuration details.",
        name: "PaymentStatusWebhookPayloadNotificationConfig",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The notification configuration ID.",
                    key: "id",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The notification configuration description.",
                    key: "description",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentStatusWebhookPayloadPayment": {
        name: "PaymentStatusWebhookPayloadPayment",
        shape: {
            extends: [],
            properties: [
                {
                    description:
                        "The unique payment ID.\n\nYou can use this ID to retrieve the payment details, or perform downstream operations.\n",
                    key: "id",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The date and time at which the payment was created in UTC format.",
                    key: "date",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "See the payment [status table](../docs#payment-status) for more information.",
                    key: "status",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentStatus",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Your reference for the payment.",
                    key: "orderId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The 3-letter currency code in [ISO 4217 format](https://en.wikipedia.org/wiki/ISO_4217#Active_codes).\ne.g. use `USD` for US dollars.\n",
                    key: "currencyCode",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The amount you charged the customer, in minor units.",
                    key: "amount",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The unique identifier for your customer.",
                    key: "customerId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "customer",
                    valueType: {
                        itemType: {
                            value: "type_:CheckoutCustomerDetailsApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Additional data to be used throughout the payment lifecycle.\n",
                    key: "metadata",
                    valueType: {
                        itemType: {
                            keyType: {
                                value: {
                                    type: "string",
                                },
                                type: "primitive",
                            },
                            valueType: {
                                type: "unknown",
                            },
                            type: "map",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The payment method options provided in the request, as well as the token used to process the payment.",
                    key: "paymentMethod",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentResponsePaymentMethodOptionsApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "More information associated with the payment processor, including the processor name.",
                    key: "processor",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentResponseProcessorApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Check this field for more information regarding the payment's status. This is especially useful when the status is `DECLINED` or `FAILED`.\n",
                    key: "statusReason",
                    valueType: {
                        itemType: {
                            value: "type_:StatusReasonApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "A list summarizing the transactions that occurred while processing the payment.\nNote: a refund is a separate transaction and so will appear in this `transactions` list if a refund was performed.",
                    key: "transactions",
                    valueType: {
                        itemType: {
                            itemType: {
                                value: "type_:TransactionOverviewApiSchema",
                                type: "id",
                            },
                            type: "list",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "riskData",
                    valueType: {
                        itemType: {
                            value: "type_:RiskDataApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentRefundWebhookPayload": {
        name: "PaymentRefundWebhookPayload",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The type of the webhook raised. `PAYMENT.REFUND` in this case.",
                    key: "eventType",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The date-time that the webhook was sent.",
                    key: "date",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The notification configuration details.",
                    key: "notificationConfig",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentRefundWebhookPayloadNotificationConfig",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The payload version",
                    key: "version",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Timestamp when the webhook content was signed",
                    key: "signedAt",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "payment",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentRefundWebhookPayloadPayment",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentRefundWebhookPayloadNotificationConfig": {
        description: "The notification configuration details.",
        name: "PaymentRefundWebhookPayloadNotificationConfig",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The notification configuration ID.",
                    key: "id",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The notification configuration description.",
                    key: "description",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentRefundWebhookPayloadPayment": {
        name: "PaymentRefundWebhookPayloadPayment",
        shape: {
            extends: [],
            properties: [
                {
                    description:
                        "The unique payment ID.\n\nYou can use this ID to retrieve the payment details, or perform downstream operations.\n",
                    key: "id",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The date and time at which the payment was created in UTC format.",
                    key: "date",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "See the payment [status table](../docs#payment-status) for more information.",
                    key: "status",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentStatus",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Your reference for the payment.",
                    key: "orderId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The 3-letter currency code in [ISO 4217 format](https://en.wikipedia.org/wiki/ISO_4217#Active_codes).\ne.g. use `USD` for US dollars.\n",
                    key: "currencyCode",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The amount you charged the customer, in minor units.",
                    key: "amount",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The unique identifier for your customer.",
                    key: "customerId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Additional data to be used throughout the payment lifecycle.\n",
                    key: "metadata",
                    valueType: {
                        itemType: {
                            keyType: {
                                value: {
                                    type: "string",
                                },
                                type: "primitive",
                            },
                            valueType: {
                                type: "unknown",
                            },
                            type: "map",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The payment method options provided in the request, as well as the token used to process the payment.",
                    key: "paymentMethod",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentResponsePaymentMethodOptionsApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "More information associated with the payment processor, including the processor name.",
                    key: "processor",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentResponseProcessorApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Check this field for more information regarding the payment's status. This is especially useful when the status is `DECLINED` or `FAILED`.\n",
                    key: "statusReason",
                    valueType: {
                        itemType: {
                            value: "type_:StatusReasonApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "A list summarizing the transactions that occurred while processing the payment.\nNote: a refund is a separate transaction and so will appear in this `transactions` list if a refund was performed.",
                    key: "transactions",
                    valueType: {
                        itemType: {
                            itemType: {
                                value: "type_:TransactionOverviewApiSchema",
                                type: "id",
                            },
                            type: "list",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "riskData",
                    valueType: {
                        itemType: {
                            value: "type_:RiskDataApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:DisputeOpenWebhookPayload": {
        name: "DisputeOpenWebhookPayload",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The type of the webhook raised. `DISPUTE.OPEN` in this case.",
                    key: "eventType",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The name of the processor that generated the dispute.",
                    key: "processorId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for the corresponding connection dispute.",
                    key: "processorDisputeId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for the Primer payment corresponding to this dispute.",
                    key: "paymentId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for the Primer transaction corresponding to this dispute.",
                    key: "transactionId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Your reference for the sale transaction that the dispute relates to.",
                    key: "orderId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for your Primer merchant account.",
                    key: "primerAccountId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:DisputeStatusWebhookPayload": {
        name: "DisputeStatusWebhookPayload",
        shape: {
            extends: [],
            properties: [
                {
                    description:
                        "The type of event that triggered the webhook. This will have the value `DISPUTE.STATUS`. This indicates that a dispute notification was issued through a configured connection.\n\nUse these notifications to proactively communicate with your customer, issue refunds, or submit evidence to challenge disputes.\n",
                    key: "eventType",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The payload version",
                    key: "version",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The type of dispute event. More information on what the `type` field represents can be found in [Manage disputes](https://primer.io/docs/accept-payments/manage-disputes)\n",
                    key: "type",
                    valueType: {
                        itemType: {
                            value: "type_:DisputeStatusWebhookPayloadType",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "To see which statuses are applicable for a dispute `type`, and how we map `status`, please see [Manage disputes](https://primer.io/docs/accept-payments/manage-disputes).\n",
                    key: "status",
                    valueType: {
                        itemType: {
                            value: "type_:DisputeStatusWebhookPayloadStatus",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for your Primer merchant account.",
                    key: "primerAccountId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for the Primer transaction corresponding to this dispute.",
                    key: "transactionId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Your reference for the sale transaction that the dispute relates to.",
                    key: "orderId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "A unique identifier for the Primer payment corresponding to this dispute.",
                    key: "paymentId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The payment method information for the payment that is now disputed.",
                    key: "paymentMethod",
                    valueType: {
                        itemType: {
                            value: "type_:DisputeStatusWebhookPayloadPaymentMethod",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The payment processor that you submitted a payment to, and received a dispute notification from.",
                    key: "processor",
                    valueType: {
                        itemType: {
                            value: "type_:DisputeStatusWebhookPayloadProcessor",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "An identifier for this dispute provided by the processor. This is shared across multiple dispute `type` and `status` relating to the same payment.\n\ne.g. as an `open` dispute that is later challenged will share a `proccessorDisputeId`.\n",
                    key: "processorDisputeId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Date and time at which Primer received the processor's dispute event. Provided as an ISO timestamp in UTC.",
                    key: "receivedAt",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Time by which the merchant must challenge a dispute. This is provided by the processor, where available.",
                    key: "challengeRequiredBy",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Primer’s unified reason that explains why the dispute was raised. This should not vary across processors for the same dispute `reasonCode`, unlike the `processorReason`.",
                    key: "reason",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The dispute reason code for a dispute. This will be the same code provided by the card schemes.",
                    key: "reasonCode",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The dispute reason provided by the processor. This can vary across processors for the same dispute `reasonCode`, which is why we provide a unified field - `reason`.",
                    key: "processorReason",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The disputed amount. Note: this is not always the same as the payment amount.\n\nThis will be displayed in minor units.\n\ne.g. for $7, use `700`. Some currencies, such as Japanese Yen, do not have minor units. In this case you should use the value as it is, without any formatting. For example for ¥100, use `100`.\n",
                    key: "amount",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "The 3-letter currency code in [ISO 4217 format](https://en.wikipedia.org/wiki/ISO_4217#Active_codes).\ne.g. use `USD` for US dollars.\n",
                    key: "currency",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The merchant ID registered at the payment processor used for this dispute.",
                    key: "merchantId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:DisputeStatusWebhookPayloadType": {
        description:
            "The type of dispute event. More information on what the `type` field represents can be found in [Manage disputes](https://primer.io/docs/accept-payments/manage-disputes)\n",
        name: "DisputeStatusWebhookPayloadType",
        shape: {
            values: [
                {
                    value: "RETRIEVAL",
                },
                {
                    value: "DISPUTE",
                },
                {
                    value: "PREARBITRATION",
                },
            ],
            type: "enum",
        },
    },
    "type_:DisputeStatusWebhookPayloadStatus": {
        description:
            "To see which statuses are applicable for a dispute `type`, and how we map `status`, please see [Manage disputes](https://primer.io/docs/accept-payments/manage-disputes).\n",
        name: "DisputeStatusWebhookPayloadStatus",
        shape: {
            values: [
                {
                    value: "OPEN",
                },
                {
                    value: "ACCEPTED",
                },
                {
                    value: "CHALLENGED",
                },
                {
                    value: "EXPIRED",
                },
                {
                    value: "CANCELLED",
                },
                {
                    value: "WON",
                },
                {
                    value: "LOST",
                },
            ],
            type: "enum",
        },
    },
    "type_:DisputeStatusWebhookPayloadPaymentMethod": {
        description: "The payment method information for the payment that is now disputed.",
        name: "DisputeStatusWebhookPayloadPaymentMethod",
        shape: {
            extends: [],
            properties: [
                {
                    key: "paymentMethodType",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentMethodTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "paymentMethodData",
                    valueType: {
                        itemType: {
                            value: "type_:DisputeStatusWebhookPayloadPaymentMethodPaymentMethodData",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:DisputeStatusWebhookPayloadPaymentMethodPaymentMethodData": {
        name: "DisputeStatusWebhookPayloadPaymentMethodPaymentMethodData",
        shape: {
            extends: [],
            properties: [
                {
                    key: "network",
                    valueType: {
                        itemType: {
                            value: "type_:CardNetworkEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:DisputeStatusWebhookPayloadProcessor": {
        description: "The payment processor that you submitted a payment to, and received a dispute notification from.",
        name: "DisputeStatusWebhookPayloadProcessor",
        shape: {
            values: [
                {
                    value: "ADYEN",
                },
                {
                    value: "BRAINTREE",
                },
            ],
            type: "enum",
        },
    },
    "type_:AccountFundingTypeEnum": {
        description: "An enumeration.",
        name: "AccountFundingTypeEnum",
        shape: {
            values: [
                {
                    value: "CREDIT",
                },
                {
                    value: "DEBIT",
                },
                {
                    value: "PREPAID",
                },
                {
                    value: "CHARGE",
                },
                {
                    value: "DEFERRED_DEBIT",
                },
                {
                    value: "UNKNOWN",
                },
            ],
            type: "enum",
        },
    },
    "type_:ApayaCustomerTokenApiSchema": {
        name: "ApayaCustomerTokenApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "mx",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "mnc",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "mcc",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:BinDataApiSchema": {
        name: "BinDataApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "network",
                    valueType: {
                        value: "type_:CardNetworkEnum",
                        type: "id",
                    },
                },
                {
                    key: "issuerCountryCode",
                    valueType: {
                        itemType: {
                            value: "type_:CountryCodeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "issuerName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "issuerCurrencyCode",
                    valueType: {
                        itemType: {
                            value: "type_:Currency",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "regionalRestriction",
                    valueType: {
                        value: "type_:CardRegionRestrictionEnum",
                        type: "id",
                    },
                },
                {
                    key: "accountNumberType",
                    valueType: {
                        value: "type_:CardAccountNumberTypeEnum",
                        type: "id",
                    },
                },
                {
                    key: "accountFundingType",
                    valueType: {
                        value: "type_:AccountFundingTypeEnum",
                        type: "id",
                    },
                },
                {
                    key: "prepaidReloadableIndicator",
                    valueType: {
                        value: "type_:PrepaidReloadableEnum",
                        type: "id",
                    },
                },
                {
                    key: "productUsageType",
                    valueType: {
                        value: "type_:CardProductTypeEnum",
                        type: "id",
                    },
                },
                {
                    key: "productCode",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "productName",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:CardAccountNumberTypeEnum": {
        description: "An enumeration.",
        name: "CardAccountNumberTypeEnum",
        shape: {
            values: [
                {
                    value: "PRIMARY_ACCOUNT_NUMBER",
                },
                {
                    value: "NETWORK_TOKEN",
                },
                {
                    value: "UNKNOWN",
                },
            ],
            type: "enum",
        },
    },
    "type_:CardNetworkEnum": {
        description:
            "[The list of available card networks and their `CARD_NETWORK_TYPE` can be found here.](https://www.notion.so/primerio/Payment-Method-Types-2b971a8c54c3452cae0b2fffe9167d72)\n",
        name: "CardNetworkEnum",
        shape: {
            value: {
                value: {
                    type: "string",
                },
                type: "primitive",
            },
            type: "alias",
        },
    },
    "type_:CardProductTypeEnum": {
        description: "An enumeration.",
        name: "CardProductTypeEnum",
        shape: {
            values: [
                {
                    value: "CONSUMER",
                },
                {
                    value: "BUSINESS",
                },
                {
                    value: "GOVERNMENT",
                },
                {
                    value: "UNKNOWN",
                },
            ],
            type: "enum",
        },
    },
    "type_:CardRegionRestrictionEnum": {
        description: "An enumeration.",
        name: "CardRegionRestrictionEnum",
        shape: {
            values: [
                {
                    value: "DOMESTIC_USE_ONLY",
                },
                {
                    value: "NONE",
                },
                {
                    value: "UNKNOWN",
                },
            ],
            type: "enum",
        },
    },
    "type_:PaymentResponsePaymentMethodOptionsApiSchema": {
        name: "PaymentResponsePaymentMethodOptionsApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The description of the payment, as it would typically appear on a bank statement.",
                    key: "descriptor",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "paymentType",
                    valueType: {
                        itemType: {
                            value: "type_:RecurringPaymentTypeSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The payment method token used to authorize the transaction.",
                    key: "paymentMethodToken",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Whether the payment method token represents a vaulted payment method and can be used for future payments.",
                    key: "isVaulted",
                    valueType: {
                        itemType: {
                            value: {
                                type: "boolean",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Unique analytics identifier corresponding to a payment method",
                    key: "analyticsId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Payment method type",
                    key: "paymentMethodType",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentMethodTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Payment method data",
                    key: "paymentMethodData",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentResponsePaymentMethodOptionsApiSchemaPaymentMethodData",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "threeDSecureAuthentication",
                    valueType: {
                        itemType: {
                            value: "type_:ThreeDSecureAuthenticationApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "authorizationType",
                    valueType: {
                        itemType: {
                            value: "type_:AuthorizationTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentResponsePaymentMethodOptionsApiSchemaPaymentMethodData": {
        description: "Payment method data",
        name: "PaymentResponsePaymentMethodOptionsApiSchemaPaymentMethodData",
        shape: {
            variants: [
                {
                    type: {
                        value: "type_:PaymentCardTokenApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:PayPalOrderTokenApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:PayPalBillingAgreementApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:GoCardlessMandateApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:KlarnaPaymentSessionApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:KlarnaCustomerTokenApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:IdealPayNlTokenApiSchema",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:ApayaCustomerTokenApiSchema",
                        type: "id",
                    },
                },
            ],
            type: "undiscriminatedUnion",
        },
    },
    "type_:CountryCodeEnum": {
        description: "An enumeration.",
        name: "CountryCodeEnum",
        shape: {
            values: [
                {
                    value: "AW",
                },
                {
                    value: "AF",
                },
                {
                    value: "AO",
                },
                {
                    value: "AI",
                },
                {
                    value: "AX",
                },
                {
                    value: "AL",
                },
                {
                    value: "AD",
                },
                {
                    value: "AE",
                },
                {
                    value: "AR",
                },
                {
                    value: "AM",
                },
                {
                    value: "AS",
                },
                {
                    value: "AQ",
                },
                {
                    value: "TF",
                },
                {
                    value: "AG",
                },
                {
                    value: "AU",
                },
                {
                    value: "AT",
                },
                {
                    value: "AZ",
                },
                {
                    value: "BI",
                },
                {
                    value: "BE",
                },
                {
                    value: "BJ",
                },
                {
                    value: "BQ",
                },
                {
                    value: "BF",
                },
                {
                    value: "BD",
                },
                {
                    value: "BG",
                },
                {
                    value: "BH",
                },
                {
                    value: "BS",
                },
                {
                    value: "BA",
                },
                {
                    value: "BL",
                },
                {
                    value: "BY",
                },
                {
                    value: "BZ",
                },
                {
                    value: "BM",
                },
                {
                    value: "BO",
                },
                {
                    value: "BR",
                },
                {
                    value: "BB",
                },
                {
                    value: "BN",
                },
                {
                    value: "BT",
                },
                {
                    value: "BV",
                },
                {
                    value: "BW",
                },
                {
                    value: "CF",
                },
                {
                    value: "CA",
                },
                {
                    value: "CC",
                },
                {
                    value: "CH",
                },
                {
                    value: "CL",
                },
                {
                    value: "CN",
                },
                {
                    value: "CI",
                },
                {
                    value: "CM",
                },
                {
                    value: "CD",
                },
                {
                    value: "CG",
                },
                {
                    value: "CK",
                },
                {
                    value: "CO",
                },
                {
                    value: "KM",
                },
                {
                    value: "CV",
                },
                {
                    value: "CR",
                },
                {
                    value: "CU",
                },
                {
                    value: "CW",
                },
                {
                    value: "CX",
                },
                {
                    value: "KY",
                },
                {
                    value: "CY",
                },
                {
                    value: "CZ",
                },
                {
                    value: "DE",
                },
                {
                    value: "DJ",
                },
                {
                    value: "DM",
                },
                {
                    value: "DK",
                },
                {
                    value: "DO",
                },
                {
                    value: "DZ",
                },
                {
                    value: "EC",
                },
                {
                    value: "EG",
                },
                {
                    value: "ER",
                },
                {
                    value: "EH",
                },
                {
                    value: "ES",
                },
                {
                    value: "EE",
                },
                {
                    value: "ET",
                },
                {
                    value: "FI",
                },
                {
                    value: "FJ",
                },
                {
                    value: "FK",
                },
                {
                    value: "FR",
                },
                {
                    value: "FO",
                },
                {
                    value: "FM",
                },
                {
                    value: "GA",
                },
                {
                    value: "GB",
                },
                {
                    value: "GE",
                },
                {
                    value: "GG",
                },
                {
                    value: "GH",
                },
                {
                    value: "GI",
                },
                {
                    value: "GN",
                },
                {
                    value: "GP",
                },
                {
                    value: "GM",
                },
                {
                    value: "GW",
                },
                {
                    value: "GQ",
                },
                {
                    value: "GR",
                },
                {
                    value: "GD",
                },
                {
                    value: "GL",
                },
                {
                    value: "GT",
                },
                {
                    value: "GF",
                },
                {
                    value: "GU",
                },
                {
                    value: "GY",
                },
                {
                    value: "HK",
                },
                {
                    value: "HM",
                },
                {
                    value: "HN",
                },
                {
                    value: "HR",
                },
                {
                    value: "HT",
                },
                {
                    value: "HU",
                },
                {
                    value: "ID",
                },
                {
                    value: "IM",
                },
                {
                    value: "IN",
                },
                {
                    value: "IO",
                },
                {
                    value: "IE",
                },
                {
                    value: "IR",
                },
                {
                    value: "IQ",
                },
                {
                    value: "IS",
                },
                {
                    value: "IL",
                },
                {
                    value: "IT",
                },
                {
                    value: "JM",
                },
                {
                    value: "JE",
                },
                {
                    value: "JO",
                },
                {
                    value: "JP",
                },
                {
                    value: "KZ",
                },
                {
                    value: "KE",
                },
                {
                    value: "KG",
                },
                {
                    value: "KH",
                },
                {
                    value: "KI",
                },
                {
                    value: "KN",
                },
                {
                    value: "KR",
                },
                {
                    value: "KW",
                },
                {
                    value: "LA",
                },
                {
                    value: "LB",
                },
                {
                    value: "LR",
                },
                {
                    value: "LY",
                },
                {
                    value: "LC",
                },
                {
                    value: "LI",
                },
                {
                    value: "LK",
                },
                {
                    value: "LS",
                },
                {
                    value: "LT",
                },
                {
                    value: "LU",
                },
                {
                    value: "LV",
                },
                {
                    value: "MO",
                },
                {
                    value: "MF",
                },
                {
                    value: "MA",
                },
                {
                    value: "MC",
                },
                {
                    value: "MD",
                },
                {
                    value: "MG",
                },
                {
                    value: "MV",
                },
                {
                    value: "MX",
                },
                {
                    value: "MH",
                },
                {
                    value: "MK",
                },
                {
                    value: "ML",
                },
                {
                    value: "MT",
                },
                {
                    value: "MM",
                },
                {
                    value: "ME",
                },
                {
                    value: "MN",
                },
                {
                    value: "MP",
                },
                {
                    value: "MZ",
                },
                {
                    value: "MR",
                },
                {
                    value: "MS",
                },
                {
                    value: "MQ",
                },
                {
                    value: "MU",
                },
                {
                    value: "MW",
                },
                {
                    value: "MY",
                },
                {
                    value: "YT",
                },
                {
                    value: "NA",
                },
                {
                    value: "NC",
                },
                {
                    value: "NE",
                },
                {
                    value: "NF",
                },
                {
                    value: "NG",
                },
                {
                    value: "NI",
                },
                {
                    value: "NU",
                },
                {
                    value: "NL",
                },
                {
                    value: "NO",
                },
                {
                    value: "NP",
                },
                {
                    value: "NR",
                },
                {
                    value: "NZ",
                },
                {
                    value: "OM",
                },
                {
                    value: "PK",
                },
                {
                    value: "PA",
                },
                {
                    value: "PN",
                },
                {
                    value: "PE",
                },
                {
                    value: "PH",
                },
                {
                    value: "PW",
                },
                {
                    value: "PG",
                },
                {
                    value: "PL",
                },
                {
                    value: "PR",
                },
                {
                    value: "KP",
                },
                {
                    value: "PT",
                },
                {
                    value: "PY",
                },
                {
                    value: "PS",
                },
                {
                    value: "PF",
                },
                {
                    value: "QA",
                },
                {
                    value: "RE",
                },
                {
                    value: "RO",
                },
                {
                    value: "RU",
                },
                {
                    value: "RW",
                },
                {
                    value: "SA",
                },
                {
                    value: "SD",
                },
                {
                    value: "SN",
                },
                {
                    value: "SG",
                },
                {
                    value: "GS",
                },
                {
                    value: "SH",
                },
                {
                    value: "SJ",
                },
                {
                    value: "SB",
                },
                {
                    value: "SL",
                },
                {
                    value: "SV",
                },
                {
                    value: "SM",
                },
                {
                    value: "SO",
                },
                {
                    value: "PM",
                },
                {
                    value: "RS",
                },
                {
                    value: "SS",
                },
                {
                    value: "ST",
                },
                {
                    value: "SR",
                },
                {
                    value: "SK",
                },
                {
                    value: "SI",
                },
                {
                    value: "SE",
                },
                {
                    value: "SZ",
                },
                {
                    value: "SX",
                },
                {
                    value: "SC",
                },
                {
                    value: "SY",
                },
                {
                    value: "TC",
                },
                {
                    value: "TD",
                },
                {
                    value: "TG",
                },
                {
                    value: "TH",
                },
                {
                    value: "TJ",
                },
                {
                    value: "TK",
                },
                {
                    value: "TM",
                },
                {
                    value: "TL",
                },
                {
                    value: "TO",
                },
                {
                    value: "TT",
                },
                {
                    value: "TN",
                },
                {
                    value: "TR",
                },
                {
                    value: "TV",
                },
                {
                    value: "TW",
                },
                {
                    value: "TZ",
                },
                {
                    value: "UG",
                },
                {
                    value: "UA",
                },
                {
                    value: "UM",
                },
                {
                    value: "UY",
                },
                {
                    value: "US",
                },
                {
                    value: "UZ",
                },
                {
                    value: "VA",
                },
                {
                    value: "VC",
                },
                {
                    value: "VE",
                },
                {
                    value: "VG",
                },
                {
                    value: "VI",
                },
                {
                    value: "VN",
                },
                {
                    value: "VU",
                },
                {
                    value: "WF",
                },
                {
                    value: "WS",
                },
                {
                    value: "YE",
                },
                {
                    value: "ZA",
                },
                {
                    value: "ZM",
                },
                {
                    value: "ZW",
                },
            ],
            type: "enum",
        },
    },
    "type_:Currency": {
        description: "Enumerates all supported currencies",
        name: "Currency",
        shape: {
            values: [
                {
                    value: "AED",
                },
                {
                    value: "AFN",
                },
                {
                    value: "ALL",
                },
                {
                    value: "AMD",
                },
                {
                    value: "ANG",
                },
                {
                    value: "AOA",
                },
                {
                    value: "ARS",
                },
                {
                    value: "AUD",
                },
                {
                    value: "AWG",
                },
                {
                    value: "AZN",
                },
                {
                    value: "BAM",
                },
                {
                    value: "BBD",
                },
                {
                    value: "BDT",
                },
                {
                    value: "BGN",
                },
                {
                    value: "BHD",
                },
                {
                    value: "BIF",
                },
                {
                    value: "BMD",
                },
                {
                    value: "BND",
                },
                {
                    value: "BOB",
                },
                {
                    value: "BOV",
                },
                {
                    value: "BRL",
                },
                {
                    value: "BSD",
                },
                {
                    value: "BTN",
                },
                {
                    value: "BWP",
                },
                {
                    value: "BYR",
                },
                {
                    value: "BYN",
                },
                {
                    value: "BZD",
                },
                {
                    value: "CAD",
                },
                {
                    value: "CDF",
                },
                {
                    value: "CHE",
                },
                {
                    value: "CHF",
                },
                {
                    value: "CHW",
                },
                {
                    value: "CLF",
                },
                {
                    value: "CLP",
                },
                {
                    value: "CNY",
                },
                {
                    value: "COP",
                },
                {
                    value: "COU",
                },
                {
                    value: "CRC",
                },
                {
                    value: "CUC",
                },
                {
                    value: "CUP",
                },
                {
                    value: "CVE",
                },
                {
                    value: "CZK",
                },
                {
                    value: "DJF",
                },
                {
                    value: "DKK",
                },
                {
                    value: "DOP",
                },
                {
                    value: "DZD",
                },
                {
                    value: "EGP",
                },
                {
                    value: "ERN",
                },
                {
                    value: "ETB",
                },
                {
                    value: "EUR",
                },
                {
                    value: "FJD",
                },
                {
                    value: "FKP",
                },
                {
                    value: "GBP",
                },
                {
                    value: "GEL",
                },
                {
                    value: "GHS",
                },
                {
                    value: "GIP",
                },
                {
                    value: "GMD",
                },
                {
                    value: "GNF",
                },
                {
                    value: "GTQ",
                },
                {
                    value: "GYD",
                },
                {
                    value: "HKD",
                },
                {
                    value: "HNL",
                },
                {
                    value: "HRK",
                },
                {
                    value: "HTG",
                },
                {
                    value: "HUF",
                },
                {
                    value: "IDR",
                },
                {
                    value: "ILS",
                },
                {
                    value: "INR",
                },
                {
                    value: "IQD",
                },
                {
                    value: "IRR",
                },
                {
                    value: "ISK",
                },
                {
                    value: "JMD",
                },
                {
                    value: "JOD",
                },
                {
                    value: "JPY",
                },
                {
                    value: "KES",
                },
                {
                    value: "KGS",
                },
                {
                    value: "KHR",
                },
                {
                    value: "KMF",
                },
                {
                    value: "KPW",
                },
                {
                    value: "KRW",
                },
                {
                    value: "KWD",
                },
                {
                    value: "KYD",
                },
                {
                    value: "KZT",
                },
                {
                    value: "LAK",
                },
                {
                    value: "LBP",
                },
                {
                    value: "LKR",
                },
                {
                    value: "LRD",
                },
                {
                    value: "LSL",
                },
                {
                    value: "LTL",
                },
                {
                    value: "LVL",
                },
                {
                    value: "LYD",
                },
                {
                    value: "MAD",
                },
                {
                    value: "MDL",
                },
                {
                    value: "MGA",
                },
                {
                    value: "MKD",
                },
                {
                    value: "MMK",
                },
                {
                    value: "MNT",
                },
                {
                    value: "MOP",
                },
                {
                    value: "MRO",
                },
                {
                    value: "MUR",
                },
                {
                    value: "MVR",
                },
                {
                    value: "MWK",
                },
                {
                    value: "MXN",
                },
                {
                    value: "MXV",
                },
                {
                    value: "MYR",
                },
                {
                    value: "MZN",
                },
                {
                    value: "NAD",
                },
                {
                    value: "NGN",
                },
                {
                    value: "NIO",
                },
                {
                    value: "NOK",
                },
                {
                    value: "NPR",
                },
                {
                    value: "NZD",
                },
                {
                    value: "OMR",
                },
                {
                    value: "PAB",
                },
                {
                    value: "PEN",
                },
                {
                    value: "PGK",
                },
                {
                    value: "PHP",
                },
                {
                    value: "PKR",
                },
                {
                    value: "PLN",
                },
                {
                    value: "PYG",
                },
                {
                    value: "QAR",
                },
                {
                    value: "RON",
                },
                {
                    value: "RSD",
                },
                {
                    value: "RUB",
                },
                {
                    value: "RWF",
                },
                {
                    value: "SAR",
                },
                {
                    value: "SBD",
                },
                {
                    value: "SCR",
                },
                {
                    value: "SDG",
                },
                {
                    value: "SEK",
                },
                {
                    value: "SGD",
                },
                {
                    value: "SHP",
                },
                {
                    value: "SLL",
                },
                {
                    value: "SOS",
                },
                {
                    value: "SRD",
                },
                {
                    value: "SSP",
                },
                {
                    value: "STD",
                },
                {
                    value: "SVC",
                },
                {
                    value: "SYP",
                },
                {
                    value: "SZL",
                },
                {
                    value: "THB",
                },
                {
                    value: "TJS",
                },
                {
                    value: "TMT",
                },
                {
                    value: "TND",
                },
                {
                    value: "TOP",
                },
                {
                    value: "TRY",
                },
                {
                    value: "TTD",
                },
                {
                    value: "TWD",
                },
                {
                    value: "TZS",
                },
                {
                    value: "UAH",
                },
                {
                    value: "UGX",
                },
                {
                    value: "USD",
                },
                {
                    value: "USN",
                },
                {
                    value: "USS",
                },
                {
                    value: "UYI",
                },
                {
                    value: "UYU",
                },
                {
                    value: "UZS",
                },
                {
                    value: "VEF",
                },
                {
                    value: "VND",
                },
                {
                    value: "VUV",
                },
                {
                    value: "WST",
                },
                {
                    value: "XAF",
                },
                {
                    value: "XAG",
                },
                {
                    value: "XAU",
                },
                {
                    value: "XBA",
                },
                {
                    value: "XBB",
                },
                {
                    value: "XBC",
                },
                {
                    value: "XBD",
                },
                {
                    value: "XCD",
                },
                {
                    value: "XDR",
                },
                {
                    value: "XFU",
                },
                {
                    value: "XOF",
                },
                {
                    value: "XPD",
                },
                {
                    value: "XPF",
                },
                {
                    value: "XPT",
                },
                {
                    value: "XSU",
                },
                {
                    value: "XTS",
                },
                {
                    value: "XUA",
                },
                {
                    value: "YER",
                },
                {
                    value: "ZAR",
                },
                {
                    value: "ZMW",
                },
                {
                    value: "ZWL",
                },
            ],
            type: "enum",
        },
    },
    "type_:PaymentResponseProcessorApiSchema": {
        name: "PaymentResponseProcessorApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The payment processor used for this payment.",
                    key: "name",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The merchant ID registered at the payment processor used for this payment.",
                    key: "processorMerchantId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "If no capture was performed, this value will be set to `0`.\n\nIf one or more partial captures were performed, this value will be a sum\nof all partial capture amounts.\n",
                    key: "amountCaptured",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "If no refund was performed, this value will be set to `0`.\n\nIf one or more partial refunds were performed, this value will be a sum\nof all partial refund amounts.\n",
                    key: "amountRefunded",
                    valueType: {
                        itemType: {
                            value: {
                                type: "integer",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:GoCardlessMandateApiSchema": {
        name: "GoCardlessMandateApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description: "Unique identifier of a GoCardless mandate agreement",
                    key: "gocardlessMandateId",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:IdealPayNlTokenApiSchema": {
        name: "IdealPayNlTokenApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "paymentMethodConfigId",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:KlarnaAddressApiSchema": {
        name: "KlarnaAddressApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "title",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "firstName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "lastName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "email",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "phoneNumber",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "addressLine1",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "addressLine2",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "addressLine3",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "city",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "state",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "countryCode",
                    valueType: {
                        itemType: {
                            value: "type_:CountryCodeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "postalCode",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:KlarnaCustomerTokenApiSchema": {
        name: "KlarnaCustomerTokenApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "klarnaCustomerToken",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "sessionData",
                    valueType: {
                        value: "type_:KlarnaSessionDetailsApiSchema",
                        type: "id",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:KlarnaPaymentSessionApiSchema": {
        name: "KlarnaPaymentSessionApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "klarnaAuthorizationToken",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "sessionData",
                    valueType: {
                        value: "type_:KlarnaSessionDetailsApiSchema",
                        type: "id",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:KlarnaSessionDetailsApiSchema": {
        name: "KlarnaSessionDetailsApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "recurringDescription",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "billingAddress",
                    valueType: {
                        value: "type_:KlarnaAddressApiSchema",
                        type: "id",
                    },
                },
                {
                    key: "shippingAddress",
                    valueType: {
                        itemType: {
                            value: "type_:KlarnaAddressApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "purchaseCountry",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "purchaseCurrency",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "locale",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "orderLines",
                    valueType: {
                        itemType: {
                            type: "unknown",
                        },
                        type: "list",
                    },
                },
                {
                    key: "tokenDetails",
                    valueType: {
                        itemType: {
                            value: "type_:KlarnaTokenDetails",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:KlarnaTokenDetails": {
        name: "KlarnaTokenDetails",
        shape: {
            extends: [],
            properties: [
                {
                    key: "type",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "brand",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "masked_number",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "expiry_date",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PayPalBillingAgreementApiSchema": {
        name: "PayPalBillingAgreementApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "paypalBillingAgreementId",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: "Information about the PayPal customer",
                    key: "externalPayerInfo",
                    valueType: {
                        itemType: {
                            value: "type_:PayPalExternalPayerInfoApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The PayPal customer's shipping address",
                    key: "shippingAddress",
                    valueType: {
                        itemType: {
                            value: "type_:AddressApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "paypalStatus",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PayPalExternalPayerInfoApiSchema": {
        name: "PayPalExternalPayerInfoApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "externalPayerId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "email",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "firstName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "lastName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PayPalOrderTokenApiSchema": {
        name: "PayPalOrderTokenApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "paypalOrderId",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: "Information about the PayPal customer",
                    key: "externalPayerInfo",
                    valueType: {
                        itemType: {
                            value: "type_:PayPalExternalPayerInfoApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "paypalStatus",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentCardTokenApiSchema": {
        name: "PaymentCardTokenApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description: '<span style="white-space: nowrap">`<= 6 characters`</span>',
                    key: "first6Digits",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: '<span style="white-space: nowrap">`<= 4 characters`</span>',
                    key: "last4Digits",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: '<span style="white-space: nowrap">`<= 2 characters`</span>',
                    key: "expirationMonth",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: '<span style="white-space: nowrap">`<= 4 characters`</span>',
                    key: "expirationYear",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "cardholderName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "network",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "isNetworkTokenized",
                    valueType: {
                        itemType: {
                            value: {
                                type: "boolean",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "binData",
                    valueType: {
                        itemType: {
                            value: "type_:BinDataApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:StatusReasonApiSchema": {
        name: "StatusReasonApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description: "Type of the status.",
                    key: "type",
                    valueType: {
                        value: "type_:PaymentStatusTypeEnum",
                        type: "id",
                    },
                },
                {
                    description:
                        "If the error is of type `ISSUER_DECLINED` this will be returned.\n\nDeclines of type `SOFT_DECLINE` may be retried,\nwhereas declines of type `HARD_DECLINE` should not be retried.\n",
                    key: "declineType",
                    valueType: {
                        itemType: {
                            value: "type_:DeclineTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "If the error is of type `ISSUER_DECLINED`, this will be returned.",
                    key: "code",
                    valueType: {
                        itemType: {
                            value: "type_:TransactionDeclineReasonV2Enum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "In case of an error on the processor's part, we will return the message returned by the processor. This is usually a human readable error.",
                    key: "message",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:RiskDataApiSchema": {
        description: "Risk data associated with this payment.\n",
        name: "RiskDataApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "fraudCheck",
                    valueType: {
                        itemType: {
                            value: "type_:FraudCheckApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:FraudCheckApiSchema": {
        description: "Results of the pre-authorization and post-authorization fraud checks.\n",
        name: "FraudCheckApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "source",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "preAuthorizationResult",
                    valueType: {
                        itemType: {
                            value: "type_:FraudDecisionTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "postAuthorizationResult",
                    valueType: {
                        itemType: {
                            value: "type_:FraudDecisionTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:FraudDecisionTypeEnum": {
        description: "Possible fraud check outcomes.",
        name: "FraudDecisionTypeEnum",
        shape: {
            values: [
                {
                    value: "ACCEPT",
                },
                {
                    value: "REFUSE",
                },
                {
                    value: "FAILED",
                },
                {
                    value: "THREE_DS",
                },
            ],
            type: "enum",
        },
    },
    "type_:PaymentMethodTypeEnum": {
        description:
            "[The list of available payment methods and their `PAYMENT_METHOD_TYPE` can be found here.](https://www.notion.so/primerio/Payment-Method-Types-2b971a8c54c3452cae0b2fffe9167d72)\n",
        name: "PaymentMethodTypeEnum",
        shape: {
            value: {
                value: {
                    type: "string",
                },
                type: "primitive",
            },
            type: "alias",
        },
    },
    "type_:PrepaidReloadableEnum": {
        description: "An enumeration.",
        name: "PrepaidReloadableEnum",
        shape: {
            values: [
                {
                    value: "RELOADABLE",
                },
                {
                    value: "NON_RELOADABLE",
                },
                {
                    value: "NOT_APPLICABLE",
                },
                {
                    value: "UNKNOWN",
                },
            ],
            type: "enum",
        },
    },
    "type_:ThreeDSecureAuthResponseCodeEnum": {
        description: "An enumeration.",
        name: "ThreeDSecureAuthResponseCodeEnum",
        shape: {
            values: [
                {
                    value: "NOT_PERFORMED",
                },
                {
                    value: "SKIPPED",
                },
                {
                    value: "AUTH_SUCCESS",
                },
                {
                    value: "AUTH_FAILED",
                },
                {
                    value: "CHALLENGE",
                },
                {
                    value: "METHOD",
                },
            ],
            type: "enum",
        },
    },
    "type_:ThreeDSecureAuthenticationApiSchema": {
        name: "ThreeDSecureAuthenticationApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "responseCode",
                    valueType: {
                        value: "type_:ThreeDSecureAuthResponseCodeEnum",
                        type: "id",
                    },
                },
                {
                    key: "reasonCode",
                    valueType: {
                        itemType: {
                            value: "type_:ThreeDSecureAuthenticationApiSchemaReasonCode",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "reasonText",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "protocolVersion",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "challengeIssued",
                    valueType: {
                        itemType: {
                            value: {
                                type: "boolean",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:ThreeDSecureAuthenticationApiSchemaReasonCode": {
        name: "ThreeDSecureAuthenticationApiSchemaReasonCode",
        shape: {
            variants: [
                {
                    type: {
                        value: "type_:ThreeDSecureSkippedReasonCodeEnum",
                        type: "id",
                    },
                },
                {
                    type: {
                        value: "type_:ThreeDSecureFailedReasonCodeEnum",
                        type: "id",
                    },
                },
            ],
            type: "undiscriminatedUnion",
        },
    },
    "type_:ThreeDSecureFailedReasonCodeEnum": {
        description:
            "This enum is derived from the `transStatusReason` on page 218 of the\n[EMV Co 3DS protocol specification](https://www.emvco.com/terms-of-use/?u=/wp-content/uploads/documents/EMVCo_3DS_Spec_v220_122018.pdf)\n\n| Code | Description                             |\n|------|-----------------------------------------|\n| 01   | Card authentication failed              |\n| 02   | Unknown Device                          |\n| 03   | Unsupported Device                      |\n| 04   | Exceeds authentication frequency limit  |\n| 05   | Expired card                            |\n| 06   | Invalid card number                     |\n| 07   | Invalid transaction                     |\n| 08   | No Card record                          |\n| 09   | Security failure                        |\n| 10   | Stolen card                             |\n| 11   | Suspected fraud                         |\n| 12   | Transaction not permitted to cardholder |\n| 13   | Cardholder not enrolled in service      |\n| 14   | Transaction timed out at the ACS        |\n| 15   | Low confidence                          |\n| 16   | Medium confidence                       |",
        name: "ThreeDSecureFailedReasonCodeEnum",
        shape: {
            values: [
                {
                    value: "UNKNOWN",
                },
                {
                    value: "REJECTED_BY_ISSUER",
                },
                {
                    value: "CARD_AUTHENTICATION_FAILED",
                },
                {
                    value: "UNKNOWN_DEVICE",
                },
                {
                    value: "UNSUPPORTED_DEVICE",
                },
                {
                    value: "EXCEEDS_AUTHENTICATION_FREQUENCY_LIMIT",
                },
                {
                    value: "EXPIRED_CARD",
                },
                {
                    value: "INVALID_CARD_NUMBER",
                },
                {
                    value: "INVALID_TRANSACTION",
                },
                {
                    value: "NO_CARD_RECORD",
                },
                {
                    value: "SECURITY_FAILURE",
                },
                {
                    value: "STOLEN_CARD",
                },
                {
                    value: "SUSPECTED_FRAUD",
                },
                {
                    value: "TRANSACTION_NOT_PERMITTED_TO_CARDHOLDER",
                },
                {
                    value: "CARDHOLDER_NOT_ENROLLED_IN_SERVICE",
                },
                {
                    value: "TRANSACTION_TIMED_OUT_AT_THE_ACS",
                },
                {
                    value: "LOW_CONFIDENCE",
                },
                {
                    value: "MEDIUM_CONFIDENCE",
                },
                {
                    value: "HIGH_CONFIDENCE",
                },
                {
                    value: "VERY_HIGH_CONFIDENCE",
                },
                {
                    value: "EXCEEDS_ACS_MAXIMUM_CHALLENGES",
                },
                {
                    value: "NON_PAYMENT_NOT_SUPPORTED",
                },
                {
                    value: "THREE_RI_NOT_SUPPORTED",
                },
                {
                    value: "ACS_TECHNICAL_ISSUE",
                },
                {
                    value: "DECOUPLED_REQUIRED_BY_ACS",
                },
                {
                    value: "DECOUPLED_MAX_EXPIRY_EXCEEDED",
                },
                {
                    value: "DECOUPLED_AUTHENTICATION_INSUFFICIENT_TIME",
                },
                {
                    value: "AUTHENTICATION_ATTEMPTED_BUT_NOT_PERFORMED_BY_CARDHOLDER",
                },
                {
                    value: "ACS_TIMED_OUT",
                },
                {
                    value: "INVALID_ACS_RESPONSE",
                },
                {
                    value: "ACS_SYSTEM_ERROR_RESPONSE",
                },
                {
                    value: "ERROR_GENERATING_CAVV",
                },
                {
                    value: "PROTOCOL_VERSION_NOT_SUPPORTED",
                },
                {
                    value: "TRANSACTION_EXCLUDED_FROM_ATTEMPTS_PROCESSING",
                },
                {
                    value: "REQUESTED_PROGRAM_NOT_SUPPORTED",
                },
            ],
            type: "enum",
        },
    },
    "type_:ThreeDSecureSkippedReasonCodeEnum": {
        description: "An enumeration.",
        name: "ThreeDSecureSkippedReasonCodeEnum",
        shape: {
            values: [
                {
                    value: "GATEWAY_UNAVAILABLE",
                },
                {
                    value: "DISABLED_BY_MERCHANT",
                },
                {
                    value: "NOT_SUPPORTED_BY_ISSUER",
                },
                {
                    value: "FAILED_TO_NEGOTIATE",
                },
                {
                    value: "UNKNOWN_ACS_RESPONSE",
                },
                {
                    value: "3DS_SERVER_ERROR",
                },
                {
                    value: "ACQUIRER_NOT_CONFIGURED",
                },
                {
                    value: "ACQUIRER_NOT_PARTICIPATING",
                },
            ],
            type: "enum",
        },
    },
    "type_:DeclineTypeEnum": {
        description: "An enumeration.",
        name: "DeclineTypeEnum",
        shape: {
            values: [
                {
                    value: "SOFT_DECLINE",
                },
                {
                    value: "HARD_DECLINE",
                },
            ],
            type: "enum",
        },
    },
    "type_:TransactionDeclineReasonV2Enum": {
        description: "An enumeration.",
        name: "TransactionDeclineReasonV2Enum",
        shape: {
            values: [
                {
                    value: "ERROR",
                },
                {
                    value: "INVALID_CARD_NUMBER",
                },
                {
                    value: "EXPIRED_CARD",
                },
                {
                    value: "LOST_OR_STOLEN_CARD",
                },
                {
                    value: "SUSPECTED_FRAUD",
                },
                {
                    value: "UNKNOWN",
                },
                {
                    value: "DECLINED",
                },
                {
                    value: "REFER_TO_CARD_ISSUER",
                },
                {
                    value: "DO_NOT_HONOR",
                },
                {
                    value: "INSUFFICIENT_FUNDS",
                },
                {
                    value: "WITHDRAWAL_LIMIT_EXCEEDED",
                },
                {
                    value: "ISSUER_TEMPORARILY_UNAVAILABLE",
                },
                {
                    value: "AUTHENTICATION_REQUIRED",
                },
            ],
            type: "enum",
        },
    },
    "type_:TransactionOverviewApiSchema": {
        name: "TransactionOverviewApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description: "The date-time that the transaction was created.",
                    key: "date",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: "The amount of the transaction, in minor units.",
                    key: "amount",
                    valueType: {
                        value: {
                            type: "integer",
                        },
                        type: "primitive",
                    },
                },
                {
                    description:
                        "The 3-letter currency code in [ISO 4217 format](https://en.wikipedia.org/wiki/ISO_4217#Active_codes).\ne.g. use `USD` for US dollars.\n",
                    key: "currencyCode",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    key: "transactionType",
                    valueType: {
                        itemType: {
                            value: "type_:TransactionTypeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "The reference submitted on payment creation or refund.",
                    key: "orderId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Processor's unique identifier for the transaction",
                    key: "processorTransactionId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "An identifier of a processor.",
                    key: "processorName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "Processor's main account identifier.\n\n* Adyen: Account code\n* Braintree: Merchant ID\n* Stripe: Account ID\"\n",
                    key: "processorMerchantId",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description:
                        "Transaction status, please refer to the [Transaction Status Codes](#section/API-Usage-Guide/Payment-Status) table for more information",
                    key: "processorStatus",
                    valueType: {
                        itemType: {
                            value: "type_:PaymentStatus",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        "If the transaction has a declined or failed status.\n\nOnly if the status is `DECLINED` or `FAILED`, otherwise `null`.\n",
                    key: "processorStatusReason",
                    valueType: {
                        itemType: {
                            value: "type_:StatusReasonApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:PaymentStatus": {
        description: "An enumeration.",
        name: "PaymentStatus",
        shape: {
            values: [
                {
                    value: "PENDING",
                },
                {
                    value: "FAILED",
                },
                {
                    value: "AUTHORIZED",
                },
                {
                    value: "SETTLING",
                },
                {
                    value: "PARTIALLY_SETTLED",
                },
                {
                    value: "SETTLED",
                },
                {
                    value: "DECLINED",
                },
                {
                    value: "CANCELLED",
                },
            ],
            type: "enum",
        },
    },
    "type_:PaymentStatusTypeEnum": {
        description: "An enumeration.",
        name: "PaymentStatusTypeEnum",
        shape: {
            values: [
                {
                    value: "APPLICATION_ERROR",
                },
                {
                    value: "GATEWAY_REJECTED",
                },
                {
                    value: "ISSUER_DECLINED",
                },
            ],
            type: "enum",
        },
    },
    "type_:TransactionTypeEnum": {
        description: "An enumeration.",
        name: "TransactionTypeEnum",
        shape: {
            values: [
                {
                    value: "SALE",
                },
                {
                    value: "REFUND",
                },
            ],
            type: "enum",
        },
    },
    "type_:AddressApiSchema": {
        name: "AddressApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    key: "firstName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "lastName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Street name, Company name or PO Box",
                    key: "addressLine1",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: "Apartment, Unit or Building number",
                    key: "addressLine2",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Name of the city, district, town or village",
                    key: "city",
                    valueType: {
                        value: {
                            type: "string",
                        },
                        type: "primitive",
                    },
                },
                {
                    description: "State, County or Province",
                    key: "state",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description: "Two letter ISO country code",
                    key: "countryCode",
                    valueType: {
                        value: "type_:CountryCodeEnum",
                        type: "id",
                    },
                },
                {
                    description: "Postal or ZIP code",
                    key: "postalCode",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:RecurringTransactionTypeEnum": {
        description: "An enumeration.",
        name: "RecurringTransactionTypeEnum",
        shape: {
            values: [
                {
                    value: "FIRST_PAYMENT",
                },
                {
                    value: "ECOMMERCE",
                },
                {
                    value: "SUBSCRIPTION",
                },
                {
                    value: "UNSCHEDULED",
                },
            ],
            type: "enum",
        },
    },
    "type_:RecurringPaymentTypeSchema": {
        description:
            "Payment types, primarily to be used for recurring payments.\nNote: If you successfully vault a `SINGLE_USE` token on payment creation, then there's no need to set a value for this field and it will be flagged as `FIRST_PAYMENT`. Otherwise, see the table below for all possible values.\n\n| paymentType | Use case |\n| --- | --- |\n| `FIRST_PAYMENT` | a customer-initiated payment which is the first in a series of recurring payments or subscription, or a card on file scenario.\n| `ECOMMERCE` | a customer-initiated payment using stored payment details where the cardholder is present.\n| `SUBSCRIPTION` | a merchant-initiated payment as part of a series of payments on a fixed schedule and a set amount.\n| `UNSCHEDULED` | a merchant-initiated payment using stored payment details with no fixed schedule or amount.",
        name: "RecurringPaymentTypeSchema",
        shape: {
            value: {
                value: "type_:RecurringTransactionTypeEnum",
                type: "id",
            },
            type: "alias",
        },
    },
    "type_:AuthorizationTypeEnum": {
        description: "Type of authorization for the payment.",
        name: "AuthorizationTypeEnum",
        shape: {
            values: [
                {
                    value: "ESTIMATED",
                },
                {
                    value: "FINAL",
                },
            ],
            type: "enum",
        },
    },
    "type_:OptionalAddressApiSchema": {
        name: "OptionalAddressApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description:
                        '<span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span>',
                    key: "firstName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        '<span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span>',
                    key: "lastName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'Street name, Company name or PO Box <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "addressLine1",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'Apartment, Unit or Building number <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "addressLine2",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'Name of the city, district, town or village <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "city",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'State, County or Province <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "state",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "countryCode",
                    valueType: {
                        itemType: {
                            value: "type_:CountryCodeEnum",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'Postal or ZIP code <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "postalCode",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
    "type_:CheckoutCustomerDetailsApiSchema": {
        name: "CheckoutCustomerDetailsApiSchema",
        shape: {
            extends: [],
            properties: [
                {
                    description:
                        "Customer email address. <br />Must be a valid email address. Supports internationalized email addresses.\n",
                    key: "emailAddress",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'The customer\'s mobile number <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "mobileNumber",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'The customer\'s first name <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "firstName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'The customer\'s last name <span style="white-space: nowrap">`non-empty`</span> <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "lastName",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "billingAddress",
                    valueType: {
                        itemType: {
                            value: "type_:OptionalAddressApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    key: "shippingAddress",
                    valueType: {
                        itemType: {
                            value: "type_:OptionalAddressApiSchema",
                            type: "id",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'The customer\'s tax id number for tax exemptions <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "taxId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
                {
                    description:
                        'The customer\'s national identification number <span style="white-space: nowrap">`<= 256 characters`</span> ',
                    key: "nationalDocumentId",
                    valueType: {
                        itemType: {
                            value: {
                                type: "string",
                            },
                            type: "primitive",
                        },
                        type: "optional",
                    },
                },
            ],
            type: "object",
        },
    },
} as Record<FernRegistryApiRead.TypeId, FernRegistryApiRead.TypeDefinition>;
