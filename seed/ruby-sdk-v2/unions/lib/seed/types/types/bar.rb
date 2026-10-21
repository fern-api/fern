# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Types
    module Types
      class Bar < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
