# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
  module Types
    module Union
      module Types
        class Dog < Internal::Types::Model
          field :name, -> { String }, optional: false, nullable: false

          field :likes_to_woof, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "likesToWoof"
        end
      end
    end
  end
end
