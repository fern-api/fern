# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Union
    module Types
      class LeafTypeB < Internal::Types::Model
        field :gamma, -> { String }, optional: false, nullable: false
      end
    end
  end
end
