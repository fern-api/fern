# frozen_string_literal: true

module Seed
  module Endpoints
    module HTTPMethods
      module Types
        class HTTPMethodsTestPatchHTTPMethodsRequest < Internal::Types::Model
          field :id, -> { String }, optional: false, nullable: false

          field :body, -> { Seed::Types::TypesObjectWithOptionalField }, optional: false, nullable: false
        end
      end
    end
  end
end
