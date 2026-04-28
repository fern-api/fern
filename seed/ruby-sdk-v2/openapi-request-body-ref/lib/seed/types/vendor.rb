# frozen_string_literal: true

module Seed
  module Types
    class Vendor < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :status, -> { Seed::Types::VendorStatus }, optional: true, nullable: false
      field :update_request, -> { Seed::Types::UpdateVendorRequest }, optional: true, nullable: false
    end
  end
end
