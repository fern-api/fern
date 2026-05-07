# frozen_string_literal: true

module Seed
  module Endpoints
    module Object_
      module Types
        class GetAndReturnNestedWithRequiredFieldObjectRequest < Internal::Types::Model
          field :string, -> { String }, optional: false, nullable: false

          field :body, -> { Seed::Types::TypesNestedObjectWithRequiredField }, optional: false, nullable: false
        end
      end
    end
  end
end
