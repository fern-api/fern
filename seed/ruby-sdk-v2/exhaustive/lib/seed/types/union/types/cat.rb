# frozen_string_literal: true

module Seed
  module Types
    module Union
      module Types
        class Cat < Internal::Types::Model
          field :name, String, optional: false, nullable: false
          field :likes_to_meow, Internal::Types::Boolean, optional: false, nullable: false

        end
      end
    end
  end
end
