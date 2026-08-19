# frozen_string_literal: true

module Seed
  module S3
    module Types
      class GetPresignedURLRequest < Internal::Types::Model
        field :s3key, -> { String }, optional: false, nullable: false, api_name: "s3Key"
      end
    end
  end
end
