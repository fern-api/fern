# frozen_string_literal: true

module Seed
  module S3
    module Types
      class GetPresignedUrlRequest < Internal::Types::Model
        field :s_3_key, -> { String }, optional: false, nullable: false, api_name: "s3Key"
      end
    end
  end
end
