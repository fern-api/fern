# frozen_string_literal: true

module Seed
  module InlinedRequests
    module Types
      class PostWithObjectBody < Internal::Types::Model
        field :string, -> { String }, optional: false, nullable: false
        field :integer, -> { Integer }, optional: false, nullable: false
        field :nested_object, lambda {
          Seed::Types::Object_::Types::ObjectWithOptionalField
        }, optional: false, nullable: false, api_name: "NestedObject"
      end
    end
  end
end
