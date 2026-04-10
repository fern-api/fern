# frozen_string_literal: true

module Seed
  module Inlinedrequests
    module Types
      class InlinedRequestsPostWithObjectBodyandResponseRequest < Internal::Types::Model
        field :string, -> { String }, optional: false, nullable: false
        field :integer, -> { Integer }, optional: false, nullable: false
        field :nested_object, -> { Seed::Types::TypesObjectWithOptionalField }, optional: false, nullable: false, api_name: "NestedObject"
      end
    end
  end
end
