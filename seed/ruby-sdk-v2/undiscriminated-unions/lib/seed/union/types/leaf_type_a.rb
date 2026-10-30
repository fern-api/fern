# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class LeafTypeA < Internal::Types::Model
        field :alpha, -> { String }, optional: false, nullable: false

        field :beta, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
