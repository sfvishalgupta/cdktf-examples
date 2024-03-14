export const enum APIGateway_EndPointType {
    EDGE_OPTIMIZED = "EDGE",
    PRIVATE = "PRIVATE",
    REGIONAL = "REGIONAL",
}

export const enum APIGateway_LoggingLevel {
    ERROR = "ERROR",
    INFO = "INFO",
    OFF = "OFF",
}

export const enum APIGateway_HTTPMethod {
    ANY = "ANY",
    DELETE = "DELETE",
    GET = "GET",
    PATCH = "PATCH",
    POST = "POST",
    PUT = "PUT",
}

export const enum APIGateway_Authorizer {
    AWS_IAM = "AWS_IAM",
    NONE = "NONE",
}