# frozen_string_literal: true

module Seed
  module Vendor
    module Types
      class UpdateVendorBody < Internal::Types::Model
        field :vendor_id, -> { String }, optional: false, nullable: false

        field :body, -> { Seed::Types::UpdateVendorRequest }, optional: false, nullable: false
      end
    end
  end
end
