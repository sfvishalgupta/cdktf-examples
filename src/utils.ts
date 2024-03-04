export function getResourceName(name: string): string {
    return `${process.env.NAMESPACE}-${process.env.ENVIRONMENT}-${name}`;
}