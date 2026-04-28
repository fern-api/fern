# frozen_string_literal: true

module Seed
  module Vendor
    module Types
      class CreateVendorRequest < Internal::Types::Model
        field :idempotency_key, -> { String }, optional: true, nullable: false
        field :name, -> { String }, optional: false, nullable: false
        field :address, -> { String }, optional: true, nullable: false
      end
    end
  end
end
