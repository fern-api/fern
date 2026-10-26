# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class UpdateVendorRequest < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false

      field :status, -> { Seed::Types::UpdateVendorRequestStatus }, optional: true, nullable: false
    end
  end
end
