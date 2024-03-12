/** This is dist ***/
exports.handler = async (event) => {
    console.log(event)
    return {
        statusCode: 200,
        body: JSON.stringify({
            resource: event.resource,
            path: event.path,
            method: event.method,
            message: "Hello World! New"
        })
    }
}