
module Seed
  module InlinedRequests
    module Types
      class PostWithObjectBody < Internal::Types::Model
        field :string, -> { String }, optional: false, nullable: false
        field :integer, -> { Integer }, optional: false, nullable: false
        field :nested_object, -> { Seed::Types::Object_::Types::ObjectWithOptionalField }, optional: false, nullable: false

      end
    end
  end
end
