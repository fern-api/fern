import { defaultFetcher, Fetcher, isResponseOk, MaybeGetter, Service, Token } from "@fern-typescript/service-utils";
import urlJoin from "url-join";
import * as model from "../model";

export interface PostsService {
    createPost(request: model.CreatePostRequest): Promise<model.CreatePostResponse>;
    getPost(request: model.GetPostRequest): Promise<model.GetPostResponse>;
    getPostV2(request: model.PostId): Promise<model.GetPostV2Response>;
}

export declare namespace PostsService {
    interface Init {
        origin: string;
        token?: MaybeGetter<Token | undefined>;
        fetcher?: Fetcher;
        headers: Headers;
    }

    interface Headers {
        "X-Service-Header": string;
    }
}

export class PostsService implements PostsService {
    private baseUrl: string;
    private fetcher: Fetcher;
    private token: MaybeGetter<Token | undefined>;
    private headers: PostsService.Headers;

    constructor(args: Service.Init) {
        this.fetcher = args.fetcher ?? defaultFetcher;
        this.baseUrl = urlJoin(args.origin, "/posts");
        this.token = args.token;
        this.headers = args.headers;
    }

    public async createPost(request: model.CreatePostRequest): Promise<model.CreatePostResponse> {
        const encodedResponse = await this.fetcher({
            url: urlJoin(this.baseUrl, "/"),
            method: "POST",
            headers: {
                ...this.headers,
            },
            token: this.token,
            body: {
                content: JSON.stringify(request.body),
                contentType: "application/json",
            },
        });

        if (isResponseOk(encodedResponse)) {
            const response = JSON.parse(new TextDecoder().decode(encodedResponse.body));
            return {
                ok: true,
                body: response as model.PostId,
            };
        } else {
            const error = JSON.parse(new TextDecoder().decode(encodedResponse.body));
            return {
                ok: false,
                error: error as model.CreatePostErrorBody,
            };
        }
    }

    public async getPost(request: model.GetPostRequest): Promise<model.GetPostResponse> {
        const queryParameters = new URLSearchParams();
        if (request.page != null) {
            queryParameters.append("page", request.page.toString());
        }
        queryParameters.append("otherParam", request.otherParam.toString());

        const encodedResponse = await this.fetcher({
            url: urlJoin(this.baseUrl, `/${request.postId}`),
            method: "GET",
            headers: {},
            token: this.token,
            queryParameters,
        });

        if (isResponseOk(encodedResponse)) {
            const response = JSON.parse(new TextDecoder().decode(encodedResponse.body));
            return {
                ok: true,
                body: response as model.Post,
            };
        } else {
            const error = JSON.parse(new TextDecoder().decode(encodedResponse.body));
            return {
                ok: false,
                error: error as model.GetPostErrorBody,
            };
        }
    }

    public async getPostV2(request: model.PostId): Promise<model.GetPostV2Response> {
        const encodedResponse = await this.fetcher({
            url: urlJoin(this.baseUrl, "/get"),
            method: "GET",
            headers: {},
            token: this.token,
            body: {
                content: JSON.stringify(request),
                contentType: "application/json",
            },
        });

        if (isResponseOk(encodedResponse)) {
            const response = JSON.parse(new TextDecoder().decode(encodedResponse.body));
            return {
                ok: true,
                body: response as model.Post,
            };
        } else {
            const error = JSON.parse(new TextDecoder().decode(encodedResponse.body));
            return {
                ok: false,
                error: error as model.GetPostV2ErrorBody,
            };
        }
    }
}
