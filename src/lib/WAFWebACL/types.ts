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