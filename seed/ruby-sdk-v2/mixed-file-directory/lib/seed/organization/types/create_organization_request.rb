# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Organization
    module Types
      class CreateOrganizationRequest < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
