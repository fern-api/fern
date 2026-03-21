# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # Tests that unknown types are able to preserve their type names.
        class ObjectWithDocumentedUnknownType < Internal::Types::Model
          field :documented_unknown_type, -> { Object }, optional: false, nullable: false, api_name: "documentedUnknownType"
        end
      end
    end
  end
end
