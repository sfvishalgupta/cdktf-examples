export const enum Authorizer {
    AWS_IAM = "AWS_IAM",
    NONE = "NONE",
}

export const enum HTTPMethod {
    ANY = "ANY",
    DELETE = "DELETE",
    GET = "GET",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT",
}

export const enum APIEndPointType {
    EDGE_OPTIMIZED = "EDGE",
    PRIVATE = "PRIVATE",
    REGIONAL = "REGIONAL",
}

export const enum APILoggingLevel {
    ERROR = "ERROR",
    INFO = "INFO",
    OFF = "OFF",
}

export const enum WAF_SCOPE {
    REGIONAL = "REGIONAL",
    CLOUDFRONT = "CLOUDFRONT"
}

export const enum WAF_AGGREGATE_KEY_TYPE {
    CONSTANT = "CONSTANT",
    CUSTOM_KEYS = "CUSTOM_KEYS",
    FORWARDED_IP = "FORWARDED_IP",
    IP = "IP",
}