
module Seed
    module Service
        class GetMetadataRequest
            field :shallow, Internal::Types::Boolean, optional: true, nullable: false
            field :tag, String, optional: true, nullable: false
            field :x_api_version, String, optional: false, nullable: false

    end
end
