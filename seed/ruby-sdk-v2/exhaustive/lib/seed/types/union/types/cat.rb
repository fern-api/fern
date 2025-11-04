# frozen_string_literal: true

module Seed
  module Types
    module Union
      module Types
        class Cat < Internal::Types::Model
          field :name, -> { String }, optional: false, nullable: false
          field :likes_to_meow, lambda {
            Internal::Types::Boolean
          }, optional: false, nullable: false, api_name: "likesToMeow"
        end
      end
    end
  end
end
