# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class TestCaseMetadata < Internal::Types::Model
            field :id, -> { String }, optional: false, nullable: false
            field :name, -> { String }, optional: false, nullable: false
            field :hidden, -> { Internal::Types::Boolean }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
