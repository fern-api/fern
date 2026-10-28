# frozen_string_literal: true

module Seed
  module Endpoints
    module Params
      module Types
        class UploadBytesWithQuery < Internal::Types::Model
          field :fields, -> { String }, optional: true, nullable: false, api_name: "_fields"
        end
      end
    end
  end
end
