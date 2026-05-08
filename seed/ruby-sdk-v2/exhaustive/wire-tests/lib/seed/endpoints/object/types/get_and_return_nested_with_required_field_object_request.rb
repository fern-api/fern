# frozen_string_literal: true

module Seed
  module Endpoints
    module Object_
      module Types
        class GetAndReturnNestedWithRequiredFieldObjectRequest < Internal::Types::Model
          field :string_value, -> { String }, optional: false, nullable: false, api_name: "stringValue"

          field :body, -> { Seed::Types::TypesNestedObjectWithRequiredField }, optional: false, nullable: false
        end
      end
    end
  end
end
