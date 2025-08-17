# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        class ObjectWithMapOfMap < Internal::Types::Model
          field :map, Internal::Types::Hash[String, Internal::Types::Hash[String, String]], optional: false, nullable: false

        end
      end
    end
  end
end
