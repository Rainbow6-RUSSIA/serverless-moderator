exports.bundle = async function (event, context) {
    const name = event.queryStringParameters.name
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'text/plain'
        },
        'isBase64Encoded': false,
        'body': `Hello, ${name}!`
    }
};