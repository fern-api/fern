# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class LeafObjectA < Internal::Types::Model
        field :only_in_a, -> { String }, optional: false, nullable: false, api_name: "onlyInA"

        field :shared_number, -> { Integer }, optional: false, nullable: false, api_name: "sharedNumber"
      end
    end
  end
end
