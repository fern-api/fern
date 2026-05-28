# frozen_string_literal: true

module Seed
  module Types
    class GetInvoiceRequest < Internal::Types::Model
      field :invoice_id, -> { String }, optional: false, nullable: false, api_name: "invoiceId"
    end
  end
end
