
module Seed
  module ReqWithHeaders
    module Types
      class ReqWithHeaders < Internal::Types::Model
        field :x_test_endpoint_header, String, optional: false, nullable: false
        field :body, String, optional: false, nullable: false

      end
    end
  end
end
