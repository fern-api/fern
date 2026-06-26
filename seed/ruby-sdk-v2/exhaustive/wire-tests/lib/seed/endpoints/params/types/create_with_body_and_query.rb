# frozen_string_literal: true

module Seed
  module Endpoints
    module Params
      module Types
        class CreateWithBodyAndQuery < Internal::Types::Model
          field :fields, -> { String }, optional: true, nullable: false, api_name: "_fields"

          field :body, -> { Seed::Types::Object_::Types::ObjectWithRequiredField }, optional: false, nullable: false
        end
      end
    end
  end
end
